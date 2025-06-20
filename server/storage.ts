import { 
  users, products, announcements, chatMessages, chatSessions,
  type User, type InsertUser, type Product, type InsertProduct, 
  type UpdateProduct, type Announcement, type InsertAnnouncement,
  type ChatMessage, type InsertChatMessage, type ChatSession, type InsertChatSession
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, ilike, or } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  sessionStore: session.SessionStore;
  
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  
  // Product methods
  getAllProducts(filters?: { category?: string; search?: string }): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, updates: UpdateProduct): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  
  // Announcement methods
  getActiveAnnouncement(): Promise<Announcement | undefined>;
  updateAnnouncement(announcement: InsertAnnouncement): Promise<Announcement>;
  
  // Chat methods
  getChatSessions(): Promise<ChatSession[]>;
  getChatSession(sessionId: string): Promise<ChatSession | undefined>;
  createChatSession(session: InsertChatSession): Promise<ChatSession>;
  updateChatSession(sessionId: string, updates: Partial<ChatSession>): Promise<ChatSession | undefined>;
  getChatMessages(sessionId: string, limit?: number): Promise<ChatMessage[]>;
  addChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.SessionStore;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    const userList = await db.select().from(users).orderBy(desc(users.createdAt));
    return userList;
  }

  async getAllProducts(filters?: { category?: string; search?: string }): Promise<Product[]> {
    let query = db.select().from(products).where(eq(products.isActive, true));
    
    if (filters?.category) {
      query = query.where(eq(products.category, filters.category as any));
    }
    
    if (filters?.search) {
      query = query.where(
        or(
          ilike(products.title, `%${filters.search}%`),
          ilike(products.description, `%${filters.search}%`)
        )
      );
    }
    
    return await query.orderBy(desc(products.createdAt));
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || undefined;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [created] = await db
      .insert(products)
      .values(product)
      .returning();
    return created;
  }

  async updateProduct(id: number, updates: UpdateProduct): Promise<Product | undefined> {
    const [updated] = await db
      .update(products)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteProduct(id: number): Promise<boolean> {
    const result = await db
      .update(products)
      .set({ isActive: false })
      .where(eq(products.id, id));
    return result.rowCount > 0;
  }

  async getActiveAnnouncement(): Promise<Announcement | undefined> {
    const [announcement] = await db
      .select()
      .from(announcements)
      .where(eq(announcements.isActive, true))
      .orderBy(desc(announcements.createdAt))
      .limit(1);
    return announcement || undefined;
  }

  async updateAnnouncement(announcement: InsertAnnouncement): Promise<Announcement> {
    // Deactivate all existing announcements
    await db.update(announcements).set({ isActive: false });
    
    // Create new active announcement
    const [created] = await db
      .insert(announcements)
      .values(announcement)
      .returning();
    return created;
  }

  async getChatSessions(): Promise<ChatSession[]> {
    const sessions = await db.select().from(chatSessions)
      .orderBy(desc(chatSessions.lastMessageAt));
    return sessions;
  }

  async getChatSession(sessionId: string): Promise<ChatSession | undefined> {
    const [session] = await db.select().from(chatSessions)
      .where(eq(chatSessions.id, sessionId));
    return session || undefined;
  }

  async createChatSession(session: InsertChatSession): Promise<ChatSession> {
    const [newSession] = await db
      .insert(chatSessions)
      .values(session)
      .returning();
    return newSession;
  }

  async updateChatSession(sessionId: string, updates: Partial<ChatSession>): Promise<ChatSession | undefined> {
    const [updatedSession] = await db
      .update(chatSessions)
      .set(updates)
      .where(eq(chatSessions.id, sessionId))
      .returning();
    return updatedSession || undefined;
  }

  async getChatMessages(sessionId: string, limit: number = 50): Promise<ChatMessage[]> {
    const messages = await db.select().from(chatMessages)
      .where(eq(chatMessages.sessionId, sessionId))
      .orderBy(desc(chatMessages.createdAt))
      .limit(limit);
    return messages.reverse();
  }

  async addChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const [newMessage] = await db
      .insert(chatMessages)
      .values(message)
      .returning();
    
    // Update session's lastMessageAt
    await db
      .update(chatSessions)
      .set({ lastMessageAt: new Date() })
      .where(eq(chatSessions.id, message.sessionId));
    
    return newMessage;
  }
}

export const storage = new DatabaseStorage();
