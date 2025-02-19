import { users, documents, type User, type InsertUser, type Document, type InsertDocument } from "@shared/schema";
import { db } from "./db";
import { eq, sql } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, update: Partial<User>): Promise<User>;
  getAllUsers(): Promise<User[]>;

  // Document operations
  createDocument(doc: InsertDocument & { embedding: number[], userId: number }): Promise<Document>;
  getDocuments(): Promise<Document[]>;
  getDocumentsByUserId(userId: number): Promise<Document[]>;
  searchSimilarDocuments(embedding: number[], limit?: number): Promise<Document[]>;
  deleteDocument(id: number): Promise<void>;
  updateDocumentTags(id: number, tags: string[]): Promise<Document>;

  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool,
      createTableIfMissing: true 
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, update: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set(update)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users);
  }

  async createDocument(doc: InsertDocument & { embedding: number[]; userId: number }): Promise<Document> {
    const vectorStr = `[${doc.embedding.join(',')}]`;

    const [document] = await db.insert(documents)
      .values({
        title: doc.title,
        content: doc.content.replace(/\0/g, '').trim(),
        embedding: sql`${vectorStr}::vector`,
        userId: doc.userId,
        createdAt: new Date().toISOString(),
        metadata: doc.metadata || { tags: [], category: 'uncategorized', summary: '' }
      })
      .returning();
    return document;
  }

  async getDocuments(): Promise<Document[]> {
    return db.select().from(documents);
  }

  async getDocumentsByUserId(userId: number): Promise<Document[]> {
    return db.select().from(documents).where(eq(documents.userId, userId));
  }

  async searchSimilarDocuments(embedding: number[], limit = 5): Promise<Document[]> {
    const vectorStr = `[${embedding.join(',')}]`;

    return db.select()
      .from(documents)
      .orderBy(sql`embedding <-> ${vectorStr}::vector`)
      .limit(limit);
  }

  async deleteDocument(id: number): Promise<void> {
    await db.delete(documents).where(eq(documents.id, id));
  }

  async updateDocumentTags(id: number, tags: string[]): Promise<Document> {
    const [document] = await db
      .select()
      .from(documents)
      .where(eq(documents.id, id));

    if (!document) {
      throw new Error("Document not found");
    }

    const updatedMetadata = {
      ...document.metadata,
      tags: tags
    };

    const [updatedDoc] = await db
      .update(documents)
      .set({ metadata: updatedMetadata })
      .where(eq(documents.id, id))
      .returning();

    return updatedDoc;
  }
}

export const storage = new DatabaseStorage();