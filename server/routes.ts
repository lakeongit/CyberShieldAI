import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { openai, generateEmbedding, improveQuery } from "./openai";
import { insertDocumentSchema } from "@shared/schema";
import { ZodError } from "zod";
import mammoth from 'mammoth';
import sharp from 'sharp';
import { createTrace, updateTrace, addSystemFeedback } from "./services/langsmith";

// Function to process different document types
async function extractTextFromDocument(content: string, fileType: string): Promise<string> {
  const buffer = Buffer.from(content, 'base64');

  // For text and markdown files, convert base64 back to text
  if (fileType === '.txt' || fileType === '.md') {
    return buffer.toString('utf-8');
  }

  // Handle image files
  if (['.png', '.jpg', '.jpeg'].includes(fileType.toLowerCase())) {
    try {
      const image = sharp(buffer);
      const metadata = await image.metadata();
      const analysis = {
        format: metadata.format,
        width: metadata.width,
        height: metadata.height,
        space: metadata.space,
        channels: metadata.channels,
        depth: metadata.depth,
      };
      return JSON.stringify({
        type: 'image',
        format: metadata.format,
        dimensions: `${metadata.width}x${metadata.height}`,
        properties: analysis,
        extracted_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Image processing error:', error);
      throw new Error('Failed to process image file');
    }
  }

  // Handle other document types
  if (fileType === '.pdf') {
    try {
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

  throw new Error(`Unsupported file type: ${fileType}`);
}

async function analyzeAndClassifyDocument(content: string) {
  const run = await createTrace("analyze_and_classify_document");
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `Analyze the following document and extract key metadata, even if it appears to be a technical log or error message. Format your response as JSON with the following structure:
{
  "category": "one of: network_security, application_security, cloud_security, incident_response, compliance, threat_intelligence, general, or logs_and_errors",
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

    const result = JSON.parse(completion.choices[0].message.content);
    await updateTrace(run.id, { content }, { result });
    await addSystemFeedback(run.id, true, "Successfully analyzed document");
    return result;
  } catch (error: any) {
    await updateTrace(run.id, { content }, undefined, error);
    await addSystemFeedback(run.id, false, error.message);
    throw error;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  app.post("/api/documents", async (req: Request, res: Response) => {
    const run = await createTrace("upload_document");
    try {
      if (!req.isAuthenticated() || !req.user?.isAdmin) {
        throw new Error("Admin access required");
      }

      const { title, content, fileType } = req.body;

      // Extract text based on file type
      const extractedText = await extractTextFromDocument(content, fileType);

      // Generate embedding and analyze document in parallel
      const [embedding, metadata] = await Promise.all([
        generateEmbedding(extractedText),
        analyzeAndClassifyDocument(extractedText)
      ]);

      // Lower confidence threshold for logs and error documents
      const confidenceThreshold = metadata.category === 'logs_and_errors' ? 0.5 : 0.7;

      if (metadata.confidence < confidenceThreshold) {
        const error = new Error("Document classification confidence too low");
        await updateTrace(run.id, { title, fileType }, { metadata }, error);
        await addSystemFeedback(run.id, false, "Low confidence in document classification");
        return res.status(400).json({
          error: "Document classification confidence too low",
          details: metadata
        });
      }

      // Store the embedding array directly without stringifying
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

      await updateTrace(run.id, { title, fileType }, { document, metadata });
      await addSystemFeedback(run.id, true, "Document successfully uploaded and processed");

      res.status(201).json({
        ...document,
        confidence: metadata.confidence
      });
    } catch (error) {
      console.error("Document creation error:", error);
      await updateTrace(run.id, req.body, undefined, error);
      await addSystemFeedback(run.id, false, error.message);

      if (error instanceof ZodError) {
        res.status(400).json({ error: "Invalid document data", details: error.errors });
      } else {
        res.status(500).json({ error: error.message || "Failed to create document" });
      }
    }
  });

  app.get("/api/documents", async (req: Request, res: Response) => {
    const run = await createTrace("list_documents");
    try {
      if (!req.isAuthenticated()) {
        throw new Error("Authentication required");
      }

      const documents = await storage.getDocuments();
      await updateTrace(run.id, {}, { count: documents.length });
      await addSystemFeedback(run.id, true);
      res.json(documents);
    } catch (error) {
      console.error("Document retrieval error:", error);
      await updateTrace(run.id, {}, undefined, error);
      await addSystemFeedback(run.id, false, error.message);
      res.status(500).json({ error: "Failed to retrieve documents" });
    }
  });

  // Chat endpoint with improved context retrieval
  app.post("/api/chat", async (req: Request, res: Response) => {
    let run;
    try {
      run = await createTrace("chat_completion");
    } catch (error) {
      console.warn("Failed to create trace:", error);
    }

    try {
      if (!req.isAuthenticated()) {
        throw new Error("Authentication required");
      }

      const { message } = req.body;
      if (!message || typeof message !== "string") {
        throw new Error("Message is required");
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
        model: "gpt-4o",
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
      if (run?.id) {
        await updateTrace(run.id, { message, improvedQuery }, { 
          response: response.answer,
          relevantDocs: relevantDocs.length 
        });
        await addSystemFeedback(run.id, true, "Successfully generated response");
      }

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
      if (run?.id) {
        await updateTrace(run.id, req.body, undefined, error);
        await addSystemFeedback(run.id, false, error.message);
      }
      res.status(500).json({ error: "Failed to process chat message" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}