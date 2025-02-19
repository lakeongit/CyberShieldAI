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
import { PDFExtract } from 'pdf.js-extract';
const pdfExtract = new PDFExtract();

// Function to process different document types
async function extractTextFromDocument(content: string, fileType: string): Promise<string> {
  try {
    const buffer = Buffer.from(content, 'base64');

    // For markdown files, preserve formatting completely
    if (fileType === '.md') {
      return buffer.toString('utf-8')
        .replace(/\0/g, '') // Only remove null bytes
        .replace(/\r\n/g, '\n') // Normalize line endings to \n
        .replace(/\r/g, '\n')   // Handle any remaining \r
        .replace(/\t/g, '    ') // Convert tabs to spaces for consistent formatting
        .trim();
    }

    // For text files, simple UTF-8 encoding
    if (fileType === '.txt') {
      return buffer.toString('utf-8')
        .replace(/\0/g, '')
        .replace(/\s+/g, ' ')
        .trim();
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

    // Handle PDF files
    if (fileType === '.pdf') {
      try {
        const options = {};
        const data = await pdfExtract.extractBuffer(buffer, options);

        if (!data || !data.pages || data.pages.length === 0) {
          throw new Error('No content found in PDF');
        }

        // Extract text from all pages and join them
        const text = data.pages
          .map(page => page.content.map(item => item.str).join(' '))
          .join('\n')
          .replace(/\0/g, '') // Remove null bytes
          .replace(/\s+/g, ' ') // Normalize whitespace
          .trim();

        if (!text) {
          throw new Error('No text content extracted from PDF');
        }

        return text;
      } catch (error) {
        console.error('PDF processing error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown PDF processing error';
        throw new Error(`Failed to process PDF file: ${errorMessage}`);
      }
    }

    // Handle Word documents
    if (fileType === '.doc' || fileType === '.docx') {
      try {
        const result = await mammoth.extractRawText({ buffer });
        return result.value.replace(/\0/g, '').replace(/\s+/g, ' ').trim();
      } catch (error) {
        console.error('DOC processing error:', error);
        throw new Error('Failed to process DOC file');
      }
    }

    throw new Error(`Unsupported file type: ${fileType}`);
  } catch (error) {
    console.error('Document processing error:', error);
    throw error;
  }
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

    const result = JSON.parse(completion.choices[0].message.content || "{}");
    await updateTrace(run?.id, { content }, { result });
    await addSystemFeedback(run?.id, true, "Successfully analyzed document");
    return result;
  } catch (error: any) {
    await updateTrace(run?.id, { content }, undefined, error);
    await addSystemFeedback(run?.id, false, error.message);
    throw error;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Add new endpoint for getting all users
  app.get("/api/users", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated() || !req.user?.isAdmin) {
        throw new Error("Admin access required");
      }

      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to fetch users"
      });
    }
  });

  // Add new endpoint for updating user admin status
  app.patch("/api/users/:id/admin", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated() || !req.user?.isAdmin) {
        throw new Error("Admin access required");
      }

      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        throw new Error("Invalid user ID");
      }

      const { isAdmin } = req.body;
      if (typeof isAdmin !== "boolean") {
        throw new Error("isAdmin must be a boolean value");
      }

      // Prevent self-demotion
      if (req.user.id === id && !isAdmin) {
        throw new Error("Cannot remove admin privileges from yourself");
      }

      const user = await storage.updateUser(id, { isAdmin });
      res.json(user);
    } catch (error) {
      console.error("Error updating user admin status:", error);
      res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to update user"
      });
    }
  });

  // Add password change endpoint
  app.patch("/api/users/:id/password", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        throw new Error("Authentication required");
      }

      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        throw new Error("Invalid user ID");
      }

      // Only allow users to change their own password, unless they're admin
      if (id !== req.user!.id && !req.user?.isAdmin) {
        throw new Error("Not authorized to change other users' passwords");
      }

      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        throw new Error("Current and new passwords are required");
      }

      const user = await storage.getUserByUsername(req.user!.username);
      if (!user || !(await comparePasswords(currentPassword, user.password))) {
        throw new Error("Current password is incorrect");
      }

      const hashedPassword = await hashPassword(newPassword);
      const updatedUser = await storage.updateUser(id, { password: hashedPassword });
      res.json({ message: "Password updated successfully" });
    } catch (error) {
      console.error("Error updating password:", error);
      res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to update password"
      });
    }
  });

  app.post("/api/documents", async (req: Request, res: Response) => {
    const run = await createTrace("upload_document");
    try {
      if (!req.isAuthenticated() || !req.user?.isAdmin) {
        throw new Error("Admin access required");
      }

      const { title, content, fileType } = req.body;
      const extractedText = await extractTextFromDocument(content, fileType);
      const [embedding, metadata] = await Promise.all([
        generateEmbedding(extractedText),
        analyzeAndClassifyDocument(extractedText)
      ]);

      const confidenceThreshold = metadata.category === 'logs_and_errors' ? 0.5 : 0.7;

      if (metadata.confidence < confidenceThreshold) {
        const error = new Error("Document classification confidence too low");
        await updateTrace(run?.id, { title, fileType }, { metadata }, error);
        await addSystemFeedback(run?.id, false, "Low confidence in document classification");
        return res.status(400).json({
          error: "Document classification confidence too low",
          details: metadata
        });
      }

      const document = await storage.createDocument({
        title,
        content: extractedText,
        embedding,
        userId: req.user!.id,
        metadata: {
          category: metadata.category,
          tags: metadata.tags,
          summary: metadata.summary
        }
      });

      await updateTrace(run?.id, { title, fileType }, { document, metadata });
      await addSystemFeedback(run?.id, true, "Document successfully uploaded and processed");

      res.status(201).json({
        ...document,
        confidence: metadata.confidence
      });
    } catch (error: unknown) {
      console.error("Document creation error:", error);
      await updateTrace(run?.id, req.body, undefined, error);
      await addSystemFeedback(run?.id, false, error instanceof Error ? error.message : "Unknown error");

      if (error instanceof ZodError) {
        res.status(400).json({ error: "Invalid document data", details: error.errors });
      } else {
        res.status(500).json({
          error: error instanceof Error ? error.message : "Failed to create document"
        });
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
      await updateTrace(run?.id, {}, { count: documents.length });
      await addSystemFeedback(run?.id, true);
      res.json(documents);
    } catch (error) {
      console.error("Document retrieval error:", error);
      await updateTrace(run?.id, {}, undefined, error);
      await addSystemFeedback(run?.id, false, error.message);
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

  app.delete("/api/documents/:id", async (req: Request, res: Response) => {
    const run = await createTrace("delete_document");
    try {
      if (!req.isAuthenticated() || !req.user?.isAdmin) {
        throw new Error("Admin access required");
      }

      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        throw new Error("Invalid document ID");
      }

      await storage.deleteDocument(id);
      await updateTrace(run?.id, { id }, { success: true });
      await addSystemFeedback(run?.id, true, "Document successfully deleted");

      res.sendStatus(200);
    } catch (error) {
      console.error("Document deletion error:", error);
      await updateTrace(run?.id, req.params, undefined, error);
      await addSystemFeedback(run?.id, false, error instanceof Error ? error.message : "Unknown error");

      res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to delete document"
      });
    }
  });

  app.patch("/api/documents/:id/tags", async (req: Request, res: Response) => {
    const run = await createTrace("update_document_tags");
    try {
      if (!req.isAuthenticated() || !req.user?.isAdmin) {
        throw new Error("Admin access required");
      }

      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        throw new Error("Invalid document ID");
      }

      const { tags } = req.body;
      if (!Array.isArray(tags)) {
        throw new Error("Tags must be an array");
      }

      const document = await storage.updateDocumentTags(id, tags);
      await updateTrace(run?.id, { id, tags }, { document });
      await addSystemFeedback(run?.id, true, "Document tags successfully updated");

      res.json(document);
    } catch (error) {
      console.error("Tag update error:", error);
      await updateTrace(run?.id, req.params, undefined, error);
      await addSystemFeedback(run?.id, false, error instanceof Error ? error.message : "Unknown error");

      res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to update tags"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}