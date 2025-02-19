import { users, documents, conversations, messages, type User, type InsertUser, type Document, type InsertDocument, type Conversation, type InsertConversation, type Message, type InsertMessage } from "@shared/schema";
import { db } from "./db";
import { eq, sql, desc, and } from "drizzle-orm";
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

  // Conversation operations
  createConversation(conversation: InsertConversation & { userId: number }): Promise<Conversation>;
  getConversation(id: number): Promise<Conversation | undefined>;
  getConversationsByUserId(userId: number): Promise<Conversation[]>;
  searchConversations(userId: number, query: string): Promise<Conversation[]>;

  // Message operations
  createMessage(message: InsertMessage & { conversationId: number }): Promise<Message>;
  getMessagesByConversationId(conversationId: number): Promise<Message[]>;

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

  async createConversation(conversation: InsertConversation & { userId: number }): Promise<Conversation> {
    const [newConversation] = await db.insert(conversations)
      .values({
        title: conversation.title,
        userId: conversation.userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return newConversation;
  }

  async getConversation(id: number): Promise<Conversation | undefined> {
    const [conversation] = await db.select()
      .from(conversations)
      .where(eq(conversations.id, id));
    return conversation;
  }

  async getConversationsByUserId(userId: number): Promise<Conversation[]> {
    return db.select()
      .from(conversations)
      .where(eq(conversations.userId, userId))
      .orderBy(desc(conversations.updatedAt));
  }

  async searchConversations(userId: number, query: string): Promise<Conversation[]> {
    return db.select()
      .from(conversations)
      .where(
        and(
          eq(conversations.userId, userId),
          sql`${conversations.title} ILIKE ${`%${query}%`}`
        )
      )
      .orderBy(desc(conversations.updatedAt));
  }

  async createMessage(message: InsertMessage & { conversationId: number }): Promise<Message> {
    const [newMessage] = await db.insert(messages)
      .values({
        ...message,
        createdAt: new Date(),
      })
      .returning();

    // Update conversation's updatedAt timestamp
    await db.update(conversations)
      .set({ updatedAt: new Date() })
      .where(eq(conversations.id, message.conversationId));

    return newMessage;
  }

  async getMessagesByConversationId(conversationId: number): Promise<Message[]> {
    return db.select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.createdAt);
  }
}

export const storage = new DatabaseStorage();