import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { openai, generateEmbedding, improveQuery } from "./openai";
import { insertDocumentSchema } from "@shared/schema";
import { ZodError } from "zod";
import mammoth from 'mammoth';

// Function to process different document types
async function extractTextFromDocument(content: string, fileType: string): Promise<string> {
  const buffer = Buffer.from(content, 'base64');

  if (fileType === '.pdf') {
    try {
      // Import pdf-parse dynamically to avoid initialization issues
      const pdfParse = (await import('pdf-parse')).default;
      const pdfData = await pdfParse(buffer);
      return pdfData.text;
    } catch (error) {
      console.error('PDF processing error:', error);
      throw new Error('Failed to process PDF file');
    }
  }

  if (fileType === '.doc' || fileType === '.docx') {
    try {
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    } catch (error) {
      console.error('DOC processing error:', error);
      throw new Error('Failed to process DOC file');
    }
  }

  // For text and markdown files, convert base64 back to text
  if (fileType === '.txt' || fileType === '.md') {
    return buffer.toString('utf-8');
  }

  throw new Error(`Unsupported file type: ${fileType}`);
}

async function analyzeAndClassifyDocument(content: string) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `Analyze the following cybersecurity document and extract key metadata. Format your response as JSON with the following structure:
{
  "category": "one of: network_security, application_security, cloud_security, incident_response, compliance, threat_intelligence, or general",
  "tags": ["array of relevant tags"],
  "summary": "a brief 2-3 sentence summary of the document",
  "confidence": 0.0 to 1.0
}`
      },
      {
        role: "user",
        content
      }
    ],
    response_format: { type: "json_object" }
  });

  return JSON.parse(completion.choices[0].message.content);
}

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Document management endpoints
  app.post("/api/documents", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated() || !req.user?.isAdmin) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const { title, content, fileType } = req.body;

      // Extract text based on file type
      const extractedText = await extractTextFromDocument(content, fileType);

      // Generate embedding and analyze document in parallel
      const [embedding, metadata] = await Promise.all([
        generateEmbedding(extractedText),
        analyzeAndClassifyDocument(extractedText)
      ]);

      // Validate confidence threshold
      if (metadata.confidence < 0.7) {
        return res.status(400).json({
          error: "Document classification confidence too low",
          details: metadata
        });
      }

      const document = await storage.createDocument({
        title,
        content: extractedText,
        embedding,
        userId: req.user.id,
        metadata: {
          category: metadata.category,
          tags: metadata.tags,
          summary: metadata.summary
        }
      });

      res.status(201).json({
        ...document,
        confidence: metadata.confidence
      });
    } catch (error) {
      console.error("Document creation error:", error);
      if (error instanceof ZodError) {
        res.status(400).json({ error: "Invalid document data", details: error.errors });
      } else {
        res.status(500).json({ error: error.message || "Failed to create document" });
      }
    }
  });

  app.get("/api/documents", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const documents = await storage.getDocuments();
      res.json(documents);
    } catch (error) {
      console.error("Document retrieval error:", error);
      res.status(500).json({ error: "Failed to retrieve documents" });
    }
  });

  // Chat endpoint with improved context retrieval
  app.post("/api/chat", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const { message } = req.body;
      if (!message || typeof message !== "string") {
        return res.status(400).json({ error: "Message is required" });
      }

      // Improve the query and generate embedding in parallel
      const [improvedQuery, messageEmbedding] = await Promise.all([
        improveQuery(message),
        generateEmbedding(message)
      ]);

      // Get relevant documents using the embedding
      const relevantDocs = await storage.searchSimilarDocuments(messageEmbedding, 3);

      // Prepare context with both original content and metadata
      const context = relevantDocs
        .map(doc => `
Document: ${doc.title}
Category: ${doc.metadata?.category || 'uncategorized'}
Content: ${doc.content}
---`).join("\n\n");

      const completion = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
        messages: [
          {
            role: "system",
            content: `You are a cybersecurity expert assistant. Use the following context to inform your responses. If the context doesn't contain relevant information, you can provide general cybersecurity guidance.

Context:
${context}

Format your response as JSON: {"answer": "your detailed response here"}`
          },
          {
            role: "user",
            content: `Original question: ${message}\nImproved question: ${improvedQuery}`
          }
        ],
        response_format: { type: "json_object" }
      });

      const response = JSON.parse(completion.choices[0].message.content);
      res.json({
        response: response.answer,
        sources: relevantDocs.map(d => ({
          id: d.id,
          title: d.title,
          category: d.metadata?.category,
          tags: d.metadata?.tags
        }))
      });
    } catch (error) {
      console.error("Chat error:", error);
      res.status(500).json({ error: "Failed to process chat message" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}