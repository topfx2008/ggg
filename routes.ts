import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import multer from "multer";
import path from "path";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertServiceSchema, insertOrderSchema, insertChatMessageSchema, insertReviewSchema } from "@shared/schema";
import { z } from "zod";

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|zip|rar/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Service routes
  app.get('/api/services', async (req, res) => {
    try {
      const { category, search, limit = 20, offset = 0 } = req.query;
      const services = await storage.getServices({
        category: category as string,
        search: search as string,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      });
      res.json(services);
    } catch (error) {
      console.error("Error fetching services:", error);
      res.status(500).json({ message: "Failed to fetch services" });
    }
  });

  app.get('/api/services/:id', async (req, res) => {
    try {
      const service = await storage.getService(req.params.id);
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }
      res.json(service);
    } catch (error) {
      console.error("Error fetching service:", error);
      res.status(500).json({ message: "Failed to fetch service" });
    }
  });

  app.post('/api/services', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const serviceData = insertServiceSchema.parse({ ...req.body, sellerId: userId });
      const service = await storage.createService(serviceData);
      res.status(201).json(service);
    } catch (error) {
      console.error("Error creating service:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid service data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create service" });
    }
  });

  app.get('/api/my-services', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const services = await storage.getServicesBySeller(userId);
      res.json(services);
    } catch (error) {
      console.error("Error fetching user services:", error);
      res.status(500).json({ message: "Failed to fetch services" });
    }
  });

  // Order routes
  app.get('/api/orders', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { role = 'buyer', status, limit = 20, offset = 0 } = req.query;
      
      const filters: any = { limit: parseInt(limit as string), offset: parseInt(offset as string) };
      if (role === 'buyer') {
        filters.buyerId = userId;
      } else {
        filters.sellerId = userId;
      }
      if (status) {
        filters.status = status;
      }
      
      const orders = await storage.getOrders(filters);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get('/api/orders/:id', isAuthenticated, async (req: any, res) => {
    try {
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      const userId = req.user.claims.sub;
      if (order.buyerId !== userId && order.sellerId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(order);
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  app.post('/api/orders', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const orderData = insertOrderSchema.parse({ ...req.body, buyerId: userId });
      const order = await storage.createOrder(orderData);
      res.status(201).json(order);
    } catch (error) {
      console.error("Error creating order:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid order data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  app.patch('/api/orders/:id', isAuthenticated, async (req: any, res) => {
    try {
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      const userId = req.user.claims.sub;
      if (order.sellerId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const updatedOrder = await storage.updateOrder(req.params.id, req.body);
      res.json(updatedOrder);
    } catch (error) {
      console.error("Error updating order:", error);
      res.status(500).json({ message: "Failed to update order" });
    }
  });

  // Chat routes
  app.get('/api/orders/:orderId/messages', isAuthenticated, async (req: any, res) => {
    try {
      const order = await storage.getOrder(req.params.orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      const userId = req.user.claims.sub;
      if (order.buyerId !== userId && order.sellerId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const messages = await storage.getChatMessages(req.params.orderId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post('/api/orders/:orderId/messages', isAuthenticated, async (req: any, res) => {
    try {
      const order = await storage.getOrder(req.params.orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      const userId = req.user.claims.sub;
      if (order.buyerId !== userId && order.sellerId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const receiverId = order.buyerId === userId ? order.sellerId : order.buyerId;
      const messageData = insertChatMessageSchema.parse({
        ...req.body,
        orderId: req.params.orderId,
        senderId: userId,
        receiverId,
      });
      
      const message = await storage.createChatMessage(messageData);
      
      // Broadcast message via WebSocket
      if (global.wss) {
        global.wss.clients.forEach((client: WebSocket) => {
          if (client.readyState === WebSocket.OPEN && (client as any).userId === receiverId) {
            client.send(JSON.stringify({
              type: 'new_message',
              data: message,
            }));
          }
        });
      }
      
      res.status(201).json(message);
    } catch (error) {
      console.error("Error creating message:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid message data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create message" });
    }
  });

  // Review routes
  app.get('/api/services/:serviceId/reviews', async (req, res) => {
    try {
      const reviews = await storage.getReviews(req.params.serviceId);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  app.post('/api/orders/:orderId/reviews', isAuthenticated, async (req: any, res) => {
    try {
      const order = await storage.getOrder(req.params.orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      const userId = req.user.claims.sub;
      if (order.buyerId !== userId) {
        return res.status(403).json({ message: "Only buyers can leave reviews" });
      }
      
      if (order.status !== 'completed') {
        return res.status(400).json({ message: "Order must be completed to leave a review" });
      }
      
      const reviewData = insertReviewSchema.parse({
        ...req.body,
        orderId: req.params.orderId,
        serviceId: order.serviceId,
        reviewerId: userId,
        revieweeId: order.sellerId,
      });
      
      const review = await storage.createReview(reviewData);
      res.status(201).json(review);
    } catch (error) {
      console.error("Error creating review:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid review data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create review" });
    }
  });

  // Search routes
  app.get('/api/search', async (req, res) => {
    try {
      const { q, category, minPrice, maxPrice } = req.query;
      if (!q) {
        return res.status(400).json({ message: "Search query is required" });
      }
      
      const services = await storage.searchServices(q as string, {
        category: category as string,
        minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
      });
      
      res.json(services);
    } catch (error) {
      console.error("Error searching services:", error);
      res.status(500).json({ message: "Failed to search services" });
    }
  });

  app.get('/api/recommended', async (req, res) => {
    try {
      const { limit = 10 } = req.query;
      const services = await storage.getRecommendedServices(undefined, parseInt(limit as string));
      res.json(services);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      res.status(500).json({ message: "Failed to fetch recommendations" });
    }
  });

  // Analytics routes
  app.get('/api/analytics/seller', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getSellerStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching seller stats:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  app.get('/api/analytics/dashboard', isAuthenticated, async (req: any, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // File upload routes
  app.post('/api/upload', isAuthenticated, upload.array('files', 10), async (req: any, res) => {
    try {
      const files = req.files as Express.Multer.File[];
      const fileUrls = files.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        path: file.path,
        size: file.size,
      }));
      
      res.json({ files: fileUrls });
    } catch (error) {
      console.error("Error uploading files:", error);
      res.status(500).json({ message: "Failed to upload files" });
    }
  });

  // Categories routes
  app.get('/api/categories', async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  const httpServer = createServer(app);

  // WebSocket server for real-time messaging
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  (global as any).wss = wss;

  wss.on('connection', (ws: WebSocket) => {
    console.log('New WebSocket connection');

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        if (data.type === 'auth') {
          (ws as any).userId = data.userId;
        }
        
        if (data.type === 'ping') {
          ws.send(JSON.stringify({ type: 'pong' }));
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    });

    ws.on('close', () => {
      console.log('WebSocket connection closed');
    });
  });

  return httpServer;
}
