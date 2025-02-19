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

  // Document operations
  createDocument(doc: InsertDocument & { embedding: number[], userId: number }): Promise<Document>;
  getDocuments(): Promise<Document[]>;
  getDocumentsByUserId(userId: number): Promise<Document[]>;
  searchSimilarDocuments(embedding: number[], limit?: number): Promise<Document[]>;

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

  async createDocument(doc: InsertDocument & { embedding: number[]; userId: number }): Promise<Document> {
    // Format the embedding array for pgvector
    const vectorStr = `[${doc.embedding.join(',')}]`;

    const [document] = await db.insert(documents)
      .values({
        title: doc.title,
        content: doc.content.replace(/\0/g, '').trim(), // Remove null bytes
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
    // Format the embedding array for pgvector
    const vectorStr = `[${embedding.join(',')}]`;

    // Using cosine similarity with pgvector
    return db.select()
      .from(documents)
      .orderBy(sql`embedding <-> ${vectorStr}::vector`)
      .limit(limit);
  }
}

export const storage = new DatabaseStorage();