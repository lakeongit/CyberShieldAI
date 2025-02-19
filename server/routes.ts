import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { openai, generateEmbedding } from "./openai";
import { insertDocumentSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Document management endpoints
  app.post("/api/documents", async (req: Request, res: Response) => {
    if (!req.isAuthenticated() || !req.user?.isAdmin) {
      return res.status(403).send("Admin access required");
    }

    try {
      const data = insertDocumentSchema.parse(req.body);
      const embedding = await generateEmbedding(data.content);
      
      const document = await storage.createDocument({
        ...data,
        embedding,
        userId: req.user.id
      });

      res.status(201).json(document);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/documents", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Authentication required");
    }

    const documents = await storage.getDocuments();
    res.json(documents);
  });

  // Chat endpoint
  app.post("/api/chat", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Authentication required");
    }

    try {
      const { message } = req.body;
      const messageEmbedding = await generateEmbedding(message);
      const relevantDocs = await storage.searchSimilarDocuments(messageEmbedding, 3);

      const context = relevantDocs
        .map(doc => doc.content)
        .join("\n\n");

      const completion = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
        messages: [
          {
            role: "system",
            content: `You are a cybersecurity expert assistant. Use this context to inform your responses:\n${context}`
          },
          { role: "user", content: message }
        ],
        response_format: { type: "json_object" }
      });

      res.json({
        response: completion.choices[0].message.content,
        sources: relevantDocs.map(d => ({ title: d.title, id: d.id }))
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
