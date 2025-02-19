import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { openai, generateEmbedding, analyzeDocument, improveQuery } from "./openai";
import { insertDocumentSchema } from "@shared/schema";
import { ZodError } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Document management endpoints
  app.post("/api/documents", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated() || !req.user?.isAdmin) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const data = insertDocumentSchema.parse(req.body);

      // Generate embedding and analyze document in parallel
      const [embedding, metadata] = await Promise.all([
        generateEmbedding(data.content),
        analyzeDocument(data.content)
      ]);

      const document = await storage.createDocument({
        ...data,
        embedding,
        userId: req.user.id,
        metadata
      });

      res.status(201).json(document);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: "Invalid document data", details: error.errors });
      } else {
        console.error("Document creation error:", error);
        res.status(500).json({ error: "Failed to create document" });
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