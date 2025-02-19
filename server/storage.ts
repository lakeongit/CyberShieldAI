import { users, documents, type User, type InsertUser, type Document, type InsertDocument } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Document operations
  createDocument(doc: InsertDocument & { embedding: string, userId: number }): Promise<Document>;
  getDocuments(): Promise<Document[]>;
  getDocumentsByUserId(userId: number): Promise<Document[]>;
  searchSimilarDocuments(embedding: string, limit?: number): Promise<Document[]>;
  
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

  async createDocument(doc: InsertDocument & { embedding: string; userId: number }): Promise<Document> {
    const [document] = await db.insert(documents)
      .values({
        ...doc,
        createdAt: new Date().toISOString(),
        metadata: { tags: [], category: 'uncategorized', summary: '' }
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

  async searchSimilarDocuments(embedding: string, limit = 5): Promise<Document[]> {
    // Using cosine similarity with pgvector
    return db.query.documents.findMany({
      orderBy: `embedding <-> '${embedding}'`,
      limit
    });
  }
}

export const storage = new DatabaseStorage();
