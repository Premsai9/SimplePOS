import { pgTable, text, serial, integer, boolean, doublePrecision, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  fullName: text("full_name"),
  role: text("role").default("user").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  currency: text("currency").default("USD"),
  taxRate: doublePrecision("tax_rate").default(7.5),
  storeName: text("store_name"),
  storeAddress: text("store_address"),
  storePhone: text("store_phone"),
  storeEmail: text("store_email"),
  receiptFooter: text("receipt_footer"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  fullName: true,
  role: true,
  currency: true,
  taxRate: true,
  storeName: true,
  storeAddress: true,
  storePhone: true,
  storeEmail: true,
  receiptFooter: true,
});

// Products table
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  price: doublePrecision("price").notNull(),
  category: text("category").notNull(),
  inventory: integer("inventory").notNull().default(0),
  imageUrl: text("image_url"),
  userId: integer("user_id").references(() => users.id),
});

export const insertProductSchema = createInsertSchema(products).pick({
  name: true,
  price: true,
  category: true,
  inventory: true,
  imageUrl: true,
  userId: true,
});

// Cart items for current transaction
export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  transactionId: integer("transaction_id"),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").notNull().default(1),
  price: doublePrecision("price").notNull(),
  userId: integer("user_id").references(() => users.id),
});

export const insertCartItemSchema = createInsertSchema(cartItems).pick({
  transactionId: true,
  productId: true,
  quantity: true,
  price: true,
  userId: true,
});

// Transactions table
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  date: timestamp("date").notNull().defaultNow(),
  subtotal: doublePrecision("subtotal").notNull(),
  tax: doublePrecision("tax").notNull(),
  total: doublePrecision("total").notNull(),
  discount: doublePrecision("discount"),
  discountType: text("discount_type"),
  paymentMethod: text("payment_method").notNull(),
  cashierId: integer("cashier_id").references(() => users.id),
  userId: integer("user_id").references(() => users.id),
  completed: boolean("completed").notNull().default(false),
  status: text("status").default("active"),
});

export const insertTransactionSchema = createInsertSchema(transactions).pick({
  subtotal: true,
  tax: true,
  total: true,
  discount: true,
  discountType: true,
  paymentMethod: true,
  cashierId: true,
  userId: true,
  completed: true,
  status: true,
});

// Categories
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  userId: integer("user_id").references(() => users.id),
  
  // Composite unique constraint on name and userId
  // This allows different users to have categories with the same name
  // but prevents a single user from having duplicate category names
});

export const insertCategorySchema = createInsertSchema(categories).pick({
  name: true,
  userId: true,
});

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
