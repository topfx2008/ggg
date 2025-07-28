import {
  users,
  services,
  orders,
  chatMessages,
  reviews,
  portfolio,
  categories,
  type User,
  type UpsertUser,
  type Service,
  type InsertService,
  type Order,
  type InsertOrder,
  type ChatMessage,
  type InsertChatMessage,
  type Review,
  type InsertReview,
  type Portfolio,
  type InsertPortfolio,
  type Category,
  type InsertCategory,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, like, sql, count, avg } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Service operations
  getServices(filters?: { category?: string; search?: string; limit?: number; offset?: number }): Promise<Service[]>;
  getService(id: string): Promise<Service | undefined>;
  getServiceBySlug(slug: string): Promise<Service | undefined>;
  createService(service: InsertService): Promise<Service>;
  updateService(id: string, service: Partial<InsertService>): Promise<Service>;
  deleteService(id: string): Promise<void>;
  getServicesBySeller(sellerId: string): Promise<Service[]>;
  
  // Order operations
  getOrders(filters?: { buyerId?: string; sellerId?: string; status?: string; limit?: number; offset?: number }): Promise<Order[]>;
  getOrder(id: string): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: string, order: Partial<InsertOrder>): Promise<Order>;
  getOrdersByUser(userId: string, role: 'buyer' | 'seller'): Promise<Order[]>;
  
  // Chat operations
  getChatMessages(orderId: string): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  markMessageAsRead(messageId: string): Promise<void>;
  getUnreadMessagesCount(userId: string): Promise<number>;
  
  // Review operations
  getReviews(serviceId?: string, userId?: string): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  getServiceRating(serviceId: string): Promise<{ averageRating: number; totalReviews: number }>;
  
  // Portfolio operations
  getPortfolio(userId: string): Promise<Portfolio[]>;
  createPortfolioItem(item: InsertPortfolio): Promise<Portfolio>;
  deletePortfolioItem(id: string): Promise<void>;
  
  // Category operations
  getCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Analytics operations
  getSellerStats(sellerId: string): Promise<{
    totalOrders: number;
    completedOrders: number;
    totalEarnings: number;
    averageRating: number;
    activeServices: number;
  }>;
  getDashboardStats(): Promise<{
    totalUsers: number;
    totalServices: number;
    totalOrders: number;
    totalRevenue: number;
  }>;
  
  // Search operations
  searchServices(query: string, filters?: { category?: string; minPrice?: number; maxPrice?: number }): Promise<Service[]>;
  getRecommendedServices(userId?: string, limit?: number): Promise<Service[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Service operations
  async getServices(filters?: { category?: string; search?: string; limit?: number; offset?: number }): Promise<Service[]> {
    const conditions = [eq(services.isActive, true)];
    
    if (filters?.category) {
      conditions.push(eq(services.category, filters.category));
    }
    
    if (filters?.search) {
      const searchCondition = or(
        like(services.title, `%${filters.search}%`),
        like(services.description, `%${filters.search}%`)
      );
      if (searchCondition) {
        conditions.push(searchCondition);
      }
    }
    
    let query = db.select().from(services).where(and(...conditions)).orderBy(desc(services.createdAt));
    
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    
    if (filters?.offset) {
      query = query.offset(filters.offset);
    }
    
    return await query;
  }

  async getService(id: string): Promise<Service | undefined> {
    const [service] = await db.select().from(services).where(eq(services.id, id));
    return service;
  }

  async getServiceBySlug(slug: string): Promise<Service | undefined> {
    const [service] = await db.select().from(services).where(eq(services.slug, slug));
    return service;
  }

  async createService(service: InsertService): Promise<Service> {
    const [newService] = await db.insert(services).values(service).returning();
    return newService;
  }

  async updateService(id: string, service: Partial<InsertService>): Promise<Service> {
    const [updatedService] = await db
      .update(services)
      .set({ ...service, updatedAt: new Date() })
      .where(eq(services.id, id))
      .returning();
    return updatedService;
  }

  async deleteService(id: string): Promise<void> {
    await db.update(services).set({ isActive: false }).where(eq(services.id, id));
  }

  async getServicesBySeller(sellerId: string): Promise<Service[]> {
    return await db.select().from(services).where(eq(services.sellerId, sellerId));
  }

  // Order operations
  async getOrders(filters?: { buyerId?: string; sellerId?: string; status?: string; limit?: number; offset?: number }): Promise<Order[]> {
    let query = db.select().from(orders);
    
    const conditions = [];
    if (filters?.buyerId) conditions.push(eq(orders.buyerId, filters.buyerId));
    if (filters?.sellerId) conditions.push(eq(orders.sellerId, filters.sellerId));
    if (filters?.status) conditions.push(eq(orders.status, filters.status as any));
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    query = query.orderBy(desc(orders.createdAt));
    
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    
    if (filters?.offset) {
      query = query.offset(filters.offset);
    }
    
    return await query;
  }

  async getOrder(id: string): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const orderNumber = `ALP-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
    const [newOrder] = await db
      .insert(orders)
      .values({ ...order, orderNumber })
      .returning();
    return newOrder;
  }

  async updateOrder(id: string, order: Partial<InsertOrder>): Promise<Order> {
    const [updatedOrder] = await db
      .update(orders)
      .set({ ...order, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return updatedOrder;
  }

  async getOrdersByUser(userId: string, role: 'buyer' | 'seller'): Promise<Order[]> {
    const condition = role === 'buyer' ? eq(orders.buyerId, userId) : eq(orders.sellerId, userId);
    return await db.select().from(orders).where(condition).orderBy(desc(orders.createdAt));
  }

  // Chat operations
  async getChatMessages(orderId: string): Promise<ChatMessage[]> {
    return await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.orderId, orderId))
      .orderBy(chatMessages.createdAt);
  }

  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const [newMessage] = await db.insert(chatMessages).values(message).returning();
    return newMessage;
  }

  async markMessageAsRead(messageId: string): Promise<void> {
    await db.update(chatMessages).set({ isRead: true }).where(eq(chatMessages.id, messageId));
  }

  async getUnreadMessagesCount(userId: string): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(chatMessages)
      .where(and(eq(chatMessages.receiverId, userId), eq(chatMessages.isRead, false)));
    return result.count;
  }

  // Review operations
  async getReviews(serviceId?: string, userId?: string): Promise<Review[]> {
    let query = db.select().from(reviews).where(eq(reviews.isPublic, true));
    
    if (serviceId) {
      query = query.where(eq(reviews.serviceId, serviceId));
    }
    
    if (userId) {
      query = query.where(eq(reviews.revieweeId, userId));
    }
    
    return await query.orderBy(desc(reviews.createdAt));
  }

  async createReview(review: InsertReview): Promise<Review> {
    const [newReview] = await db.insert(reviews).values(review).returning();
    return newReview;
  }

  async getServiceRating(serviceId: string): Promise<{ averageRating: number; totalReviews: number }> {
    const [result] = await db
      .select({
        averageRating: avg(reviews.rating),
        totalReviews: count(),
      })
      .from(reviews)
      .where(eq(reviews.serviceId, serviceId));
    
    return {
      averageRating: result.averageRating ? Number(result.averageRating) : 0,
      totalReviews: result.totalReviews,
    };
  }

  // Portfolio operations
  async getPortfolio(userId: string): Promise<Portfolio[]> {
    return await db
      .select()
      .from(portfolio)
      .where(and(eq(portfolio.userId, userId), eq(portfolio.isPublic, true)))
      .orderBy(desc(portfolio.createdAt));
  }

  async createPortfolioItem(item: InsertPortfolio): Promise<Portfolio> {
    const [newItem] = await db.insert(portfolio).values(item).returning();
    return newItem;
  }

  async deletePortfolioItem(id: string): Promise<void> {
    await db.delete(portfolio).where(eq(portfolio.id, id));
  }

  // Category operations
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories).where(eq(categories.isActive, true)).orderBy(categories.sortOrder);
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db.insert(categories).values(category).returning();
    return newCategory;
  }

  // Analytics operations
  async getSellerStats(sellerId: string): Promise<{
    totalOrders: number;
    completedOrders: number;
    totalEarnings: number;
    averageRating: number;
    activeServices: number;
  }> {
    const [orderStats] = await db
      .select({
        totalOrders: count(),
        totalEarnings: sql<number>`sum(${orders.price})`,
      })
      .from(orders)
      .where(eq(orders.sellerId, sellerId));

    const [completedOrderStats] = await db
      .select({ completedOrders: count() })
      .from(orders)
      .where(and(eq(orders.sellerId, sellerId), eq(orders.status, 'completed')));

    const [ratingStats] = await db
      .select({ averageRating: avg(reviews.rating) })
      .from(reviews)
      .where(eq(reviews.revieweeId, sellerId));

    const [serviceStats] = await db
      .select({ activeServices: count() })
      .from(services)
      .where(and(eq(services.sellerId, sellerId), eq(services.isActive, true)));

    return {
      totalOrders: orderStats.totalOrders || 0,
      completedOrders: completedOrderStats.completedOrders || 0,
      totalEarnings: orderStats.totalEarnings || 0,
      averageRating: ratingStats.averageRating ? Number(ratingStats.averageRating) : 0,
      activeServices: serviceStats.activeServices || 0,
    };
  }

  async getDashboardStats(): Promise<{
    totalUsers: number;
    totalServices: number;
    totalOrders: number;
    totalRevenue: number;
  }> {
    const [userStats] = await db.select({ totalUsers: count() }).from(users);
    const [serviceStats] = await db.select({ totalServices: count() }).from(services);
    const [orderStats] = await db
      .select({
        totalOrders: count(),
        totalRevenue: sql<number>`sum(${orders.price})`,
      })
      .from(orders);

    return {
      totalUsers: userStats.totalUsers || 0,
      totalServices: serviceStats.totalServices || 0,
      totalOrders: orderStats.totalOrders || 0,
      totalRevenue: orderStats.totalRevenue || 0,
    };
  }

  // Search operations
  async searchServices(query: string, filters?: { category?: string; minPrice?: number; maxPrice?: number }): Promise<Service[]> {
    let dbQuery = db
      .select()
      .from(services)
      .where(
        and(
          eq(services.isActive, true),
          or(
            like(services.title, `%${query}%`),
            like(services.description, `%${query}%`),
            like(services.category, `%${query}%`)
          )
        )
      );

    if (filters?.category) {
      dbQuery = dbQuery.where(eq(services.category, filters.category));
    }

    return await dbQuery.orderBy(desc(services.createdAt));
  }

  async getRecommendedServices(userId?: string, limit = 10): Promise<Service[]> {
    // Basic recommendation: popular services + recent services
    return await db
      .select()
      .from(services)
      .where(eq(services.isActive, true))
      .orderBy(desc(services.createdAt))
      .limit(limit);
  }
}

export const storage = new DatabaseStorage();
