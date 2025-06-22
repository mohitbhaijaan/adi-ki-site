import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertProductSchema, updateProductSchema, insertAnnouncementSchema, insertChatMessageSchema, insertChatSessionSchema, insertUserSchema, insertCategorySchema, insertResourceSchema, updateResourceSchema } from "@shared/schema";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  // Authentication middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }
    next();
  };

  // Products API
  app.get("/api/products", async (req, res, next) => {
    try {
      const { category, search } = req.query;
      const products = await storage.getAllProducts({
        category: category as string,
        search: search as string,
      });
      res.json(products);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/products/:id", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.getProduct(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      next(error);
    }
  });

  // Admin-only routes
  const requireAdmin = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated() || !req.user?.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }
    next();
  };

  // Users API (Admin only)
  app.get("/api/users", requireAdmin, async (req, res, next) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/users", requireAdmin, async (req, res, next) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/products", requireAdmin, async (req, res, next) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      next(error);
    }
  });

  app.patch("/api/products/:id", requireAdmin, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const updates = updateProductSchema.parse(req.body);
      const product = await storage.updateProduct(id, updates);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/products/:id", requireAdmin, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteProduct(id);
      if (!success) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  });

  // Announcements API
  app.get("/api/announcements/active", async (req, res, next) => {
    try {
      const announcement = await storage.getActiveAnnouncement();
      res.json(announcement);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/announcements", requireAdmin, async (req, res, next) => {
    try {
      const announcementData = insertAnnouncementSchema.parse(req.body);
      const announcement = await storage.updateAnnouncement(announcementData);
      res.json(announcement);
    } catch (error) {
      next(error);
    }
  });

  // Chat API
  app.get("/api/chat/sessions", async (req, res, next) => {
    try {
      const sessions = await storage.getChatSessions();
      res.json(sessions);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/chat/sessions", async (req, res, next) => {
    try {
      const sessionData = insertChatSessionSchema.parse(req.body);
      const session = await storage.createChatSession(sessionData);
      res.status(201).json(session);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/chat/sessions/:sessionId/messages", async (req, res, next) => {
    try {
      const messages = await storage.getChatMessages(req.params.sessionId);
      res.json(messages);
    } catch (error) {
      next(error);
    }
  });

  // Add message via HTTP API (fallback)
  app.post("/api/chat/messages", async (req, res, next) => {
    try {
      const chatMessage = insertChatMessageSchema.parse(req.body);
      const savedMessage = await storage.addChatMessage(chatMessage);
      
      // Broadcast to WebSocket clients
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          const clientInfo = connectedClients.get(client);
          if (clientInfo && (clientInfo.sessionId === savedMessage.sessionId || clientInfo.isAdmin)) {
            client.send(JSON.stringify({
              type: 'new_message',
              payload: savedMessage
            }));
          }
        }
      });
      
      res.status(201).json(savedMessage);
    } catch (error) {
      next(error);
    }
  });

  // Delete chat session (admin only)
  app.delete("/api/chat/sessions/:sessionId", requireAuth, async (req, res, next) => {
    try {
      if (!req.user?.isAdmin) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const success = await storage.deleteChatSession(req.params.sessionId);
      
      if (success) {
        // Notify WebSocket clients that session was deleted
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            const clientInfo = connectedClients.get(client);
            if (clientInfo && clientInfo.isAdmin) {
              client.send(JSON.stringify({
                type: 'session_deleted',
                sessionId: req.params.sessionId
              }));
            }
          }
        });
        
        res.json({ success: true });
      } else {
        res.status(500).json({ error: "Failed to delete chat session" });
      }
    } catch (error) {
      next(error);
    }
  });

  // Create user (owner only)
  app.post("/api/users", requireAuth, async (req, res, next) => {
    try {
      const currentUser = await storage.getUser(req.user.id);
      if (!currentUser || currentUser.role !== 'owner') {
        return res.status(403).json({ error: "Owner access required" });
      }

      const userData = insertUserSchema.parse({
        ...req.body,
        createdBy: req.user.id
      });
      
      // Hash password before storing
      const hashedPassword = await hashPassword(userData.password);
      const userDataWithHashedPassword = {
        ...userData,
        password: hashedPassword
      };
      
      const newUser = await storage.createUser(userDataWithHashedPassword);
      res.status(201).json(newUser);
    } catch (error) {
      next(error);
    }
  });

  // Delete user (owner only, cannot delete self)
  app.delete("/api/users/:id", requireAuth, async (req, res, next) => {
    try {
      const currentUser = await storage.getUser(req.user.id);
      if (!currentUser || currentUser.role !== 'owner') {
        return res.status(403).json({ error: "Owner access required" });
      }

      const userId = parseInt(req.params.id);
      if (userId === req.user.id) {
        return res.status(403).json({ error: "Cannot delete yourself" });
      }

      const success = await storage.deleteUser(userId);
      
      if (success) {
        res.json({ success: true });
      } else {
        res.status(500).json({ error: "Failed to delete user" });
      }
    } catch (error) {
      next(error);
    }
  });

  // Category routes
  app.get("/api/categories", async (req, res, next) => {
    try {
      const categories = await storage.getAllCategories();
      res.json(categories);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/categories", requireAdmin, async (req, res, next) => {
    try {
      const result = insertCategorySchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid category data", errors: result.error.issues });
      }

      const category = await storage.createCategory(result.data);
      res.status(201).json(category);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/categories/:id", requireAdmin, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }

      const success = await storage.deleteCategory(id);
      
      if (!success) {
        return res.status(404).json({ message: "Category not found" });
      }

      res.json({ message: "Category deleted successfully. Products with this category have been set to 'not provided'." });
    } catch (error) {
      next(error);
    }
  });

  // Resource routes
  app.get("/api/resources", async (req, res, next) => {
    try {
      const resources = await storage.getAllResources();
      res.json(resources);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/resources", requireAdmin, async (req, res, next) => {
    try {
      const result = insertResourceSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid resource data", errors: result.error.issues });
      }

      const resource = await storage.createResource(result.data);
      res.status(201).json(resource);
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/resources/:id", requireAdmin, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid resource ID" });
      }

      const result = updateResourceSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid resource data", errors: result.error.issues });
      }

      const resource = await storage.updateResource(id, result.data);
      
      if (!resource) {
        return res.status(404).json({ message: "Resource not found" });
      }

      res.json(resource);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/resources/:id", requireAdmin, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid resource ID" });
      }

      const success = await storage.deleteResource(id);
      
      if (!success) {
        return res.status(404).json({ message: "Resource not found" });
      }

      res.json({ message: "Resource deleted successfully" });
    } catch (error) {
      next(error);
    }
  });

  const httpServer = createServer(app);

  // WebSocket for real-time chat
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  // Store connected clients with session info
  const connectedClients = new Map();

  wss.on('connection', (ws) => {
    console.log('New WebSocket connection');
    let clientSessionId = null;

    ws.on('message', async (data) => {
      try {
        const messageData = JSON.parse(data.toString());
        
        if (messageData.type === 'join_session') {
          clientSessionId = messageData.sessionId;
          connectedClients.set(ws, { sessionId: clientSessionId });
          console.log('Client joined session:', clientSessionId);
          
          // Send confirmation
          ws.send(JSON.stringify({
            type: 'session_joined',
            sessionId: clientSessionId
          }));
        }
        
        if (messageData.type === 'chat_message') {
          const chatMessage = insertChatMessageSchema.parse(messageData.payload);
          const savedMessage = await storage.addChatMessage(chatMessage);
          
          // Broadcast to all connected clients (session participants and admins)
          let messagesSent = 0;
          wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              const clientInfo = connectedClients.get(client);
              // Send to same session or to any admin
              if (clientInfo && (clientInfo.sessionId === savedMessage.sessionId || clientInfo.isAdmin)) {
                client.send(JSON.stringify({
                  type: 'new_message',
                  payload: savedMessage
                }));
                messagesSent++;
                console.log(`Message sent to client in session: ${clientInfo.sessionId}, isAdmin: ${clientInfo.isAdmin}`);
              }
            }
          });
          console.log(`Total messages sent: ${messagesSent} for session: ${savedMessage.sessionId}`);

          console.log('Message broadcasted:', savedMessage.message, 'to session:', savedMessage.sessionId);
        }

        if (messageData.type === 'admin_join') {
          connectedClients.set(ws, { isAdmin: true });
          console.log('Admin joined WebSocket');
          
          // Send all active sessions to admin
          const sessions = await storage.getChatSessions();
          ws.send(JSON.stringify({
            type: 'admin_sessions',
            payload: sessions
          }));
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      console.log('WebSocket connection closed');
      connectedClients.delete(ws);
    });
  });

  return httpServer;
}
