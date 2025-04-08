import { 
  users, type User, type InsertUser,
  products, type Product, type InsertProduct,
  cartItems, type CartItem, type InsertCartItem,
  transactions, type Transaction, type InsertTransaction,
  categories, type Category, type InsertCategory
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserSettings(id: number, settings: { 
    currency?: string; 
    taxRate?: number;
    storeName?: string;
    storeAddress?: string;
    storePhone?: string;
    storeEmail?: string;
    receiptFooter?: string;
  }): Promise<User | undefined>;

  // Product methods
  getAllProducts(userId?: number): Promise<Product[]>;
  getProductById(id: number, userId?: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>, userId?: number): Promise<Product | undefined>;
  deleteProduct(id: number, userId?: number): Promise<boolean>;
  getProductsByCategory(category: string, userId?: number): Promise<Product[]>;

  // Cart methods
  getCartItems(transactionId?: number): Promise<CartItem[]>;
  addToCart(item: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: number, quantity: number): Promise<CartItem | undefined>;
  removeCartItem(id: number): Promise<boolean>;
  clearCart(transactionId?: number): Promise<boolean>;

  // Transaction methods
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getTransaction(id: number, userId?: number): Promise<Transaction | undefined>;
  getAllTransactions(userId?: number): Promise<Transaction[]>;
  completeTransaction(id: number, paymentMethod: string): Promise<Transaction | undefined>;

  // Category methods
  getAllCategories(userId?: number): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private products: Map<number, Product>;
  private cartItems: Map<number, CartItem>;
  private transactions: Map<number, Transaction>;
  private categories: Map<number, Category>;
  
  private userId: number;
  private productId: number;
  private cartItemId: number;
  private transactionId: number;
  private categoryId: number;

  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.cartItems = new Map();
    this.transactions = new Map();
    this.categories = new Map();
    
    this.userId = 1;
    this.productId = 1;
    this.cartItemId = 1;
    this.transactionId = 1;
    this.categoryId = 1;

    // Initialize with sample categories
    this.initializeData();
  }

  private initializeData() {
    // Add default categories
    const defaultCategories = ["All", "Food", "Beverages", "Household", "Electronics"];
    defaultCategories.forEach(name => {
      this.createCategory({ name });
    });

    // Add sample products
    const sampleProducts: InsertProduct[] = [
      { name: "Premium Coffee", price: 3.99, category: "Beverages", inventory: 45, imageUrl: "https://images.unsplash.com/photo-1553787762-b5f5721f3b8d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200&q=80" },
      { name: "Club Sandwich", price: 5.49, category: "Food", inventory: 28, imageUrl: "https://images.unsplash.com/photo-1512152272829-e3139592d56f?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200&q=80" },
      { name: "Paper Towels", price: 2.99, category: "Household", inventory: 60, imageUrl: "https://images.unsplash.com/photo-1594311431621-0df167499096?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200&q=80" },
      { name: "Wireless Headphones", price: 49.99, category: "Electronics", inventory: 12, imageUrl: "https://images.unsplash.com/photo-1593162711562-9e0af20c8a3b?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200&q=80" },
      { name: "Potato Chips", price: 1.49, category: "Food", inventory: 87, imageUrl: "https://images.unsplash.com/photo-1561736778-92e52a7769ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200&q=80" },
      { name: "Chocolate Bar", price: 2.25, category: "Food", inventory: 52, imageUrl: "https://images.unsplash.com/photo-1560624052-449f5ddf0c31?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200&q=80" },
      { name: "Bottled Water", price: 0.99, category: "Beverages", inventory: 124, imageUrl: "https://images.unsplash.com/photo-1610885634663-71f958364a6b?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200&q=80" },
      { name: "AA Batteries (4pk)", price: 3.49, category: "Electronics", inventory: 35, imageUrl: "https://images.unsplash.com/photo-1582452932537-6dbb452652c8?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200&q=80" },
    ];

    sampleProducts.forEach(product => {
      this.createProduct(product);
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { 
      ...insertUser, 
      id,
      role: "user",
      createdAt: new Date(),
      email: insertUser.email || null,
      fullName: insertUser.fullName || null,
      currency: insertUser.currency || "USD",
      taxRate: insertUser.taxRate || 7.5,
      storeName: insertUser.storeName || null,
      storeAddress: insertUser.storeAddress || null,
      storePhone: insertUser.storePhone || null,
      storeEmail: insertUser.storeEmail || null,
      receiptFooter: insertUser.receiptFooter || null
    };
    this.users.set(id, user);
    return user;
  }
  
  async updateUserSettings(id: number, settings: { 
    currency?: string; 
    taxRate?: number;
    storeName?: string;
    storeAddress?: string;
    storePhone?: string;
    storeEmail?: string;
    receiptFooter?: string;
  }): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { 
      ...user,
      currency: settings.currency !== undefined ? settings.currency : user.currency,
      taxRate: settings.taxRate !== undefined ? settings.taxRate : user.taxRate,
      storeName: settings.storeName !== undefined ? settings.storeName : user.storeName,
      storeAddress: settings.storeAddress !== undefined ? settings.storeAddress : user.storeAddress,
      storePhone: settings.storePhone !== undefined ? settings.storePhone : user.storePhone,
      storeEmail: settings.storeEmail !== undefined ? settings.storeEmail : user.storeEmail,
      receiptFooter: settings.receiptFooter !== undefined ? settings.receiptFooter : user.receiptFooter
    };
    
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Product methods
  async getAllProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProductById(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const id = this.productId++;
    const newProduct: Product = { 
      ...product, 
      id,
      inventory: product.inventory || 0,
      imageUrl: product.imageUrl || null,
      userId: product.userId || null
    };
    this.products.set(id, newProduct);
    return newProduct;
  }

  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const existingProduct = this.products.get(id);
    if (!existingProduct) return undefined;

    const updatedProduct = { ...existingProduct, ...product };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<boolean> {
    return this.products.delete(id);
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    if (category === "All") {
      return this.getAllProducts();
    }
    return Array.from(this.products.values()).filter(
      (product) => product.category === category
    );
  }

  // Cart methods
  async getCartItems(transactionId?: number): Promise<CartItem[]> {
    const items = Array.from(this.cartItems.values());
    if (transactionId) {
      return items.filter(item => item.transactionId === transactionId);
    }
    return items.filter(item => item.transactionId === undefined || item.transactionId === null);
  }

  async addToCart(item: InsertCartItem): Promise<CartItem> {
    // Check if this product is already in the cart
    // Handle null, undefined correctly for transaction ID
    const txId = item.transactionId !== null && item.transactionId !== undefined ? item.transactionId : undefined;
    const existingItems = await this.getCartItems(txId);
    const existingItem = existingItems.find(i => i.productId === item.productId);

    if (existingItem) {
      // Update quantity instead of adding new item
      return this.updateCartItem(existingItem.id, existingItem.quantity + (item.quantity || 1)) as Promise<CartItem>;
    }

    const id = this.cartItemId++;
    const newItem: CartItem = { 
      ...item, 
      id,
      transactionId: item.transactionId || null,
      quantity: item.quantity || 1,
      userId: item.userId || null
    };
    this.cartItems.set(id, newItem);
    return newItem;
  }

  async updateCartItem(id: number, quantity: number): Promise<CartItem | undefined> {
    const item = this.cartItems.get(id);
    if (!item) return undefined;

    if (quantity <= 0) {
      await this.removeCartItem(id);
      return undefined;
    }

    const updatedItem = { ...item, quantity };
    this.cartItems.set(id, updatedItem);
    return updatedItem;
  }

  async removeCartItem(id: number): Promise<boolean> {
    return this.cartItems.delete(id);
  }

  async clearCart(transactionId?: number): Promise<boolean> {
    if (transactionId) {
      // Clear only items for a specific transaction
      const itemsToRemove = Array.from(this.cartItems.values())
        .filter(item => item.transactionId === transactionId)
        .map(item => item.id);
      
      itemsToRemove.forEach(id => this.cartItems.delete(id));
      return true;
    } else {
      // Clear items not associated with any transaction
      const itemsToRemove = Array.from(this.cartItems.values())
        .filter(item => item.transactionId === undefined || item.transactionId === null)
        .map(item => item.id);
      
      itemsToRemove.forEach(id => this.cartItems.delete(id));
      return true;
    }
  }

  // Transaction methods
  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const id = this.transactionId++;
    const date = new Date();
    const newTransaction: Transaction = { 
      ...transaction, 
      id, 
      date,
      status: transaction.status || null,
      completed: transaction.completed || false,
      discount: transaction.discount || null,
      discountType: transaction.discountType || null,
      cashierId: transaction.cashierId || null,
      userId: transaction.userId || null
    };
    this.transactions.set(id, newTransaction);
    return newTransaction;
  }

  async getTransaction(id: number): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }

  async getAllTransactions(): Promise<Transaction[]> {
    return Array.from(this.transactions.values());
  }

  async completeTransaction(id: number, paymentMethod: string): Promise<Transaction | undefined> {
    const transaction = this.transactions.get(id);
    if (!transaction) return undefined;

    const updatedTransaction = { ...transaction, completed: true, paymentMethod };
    this.transactions.set(id, updatedTransaction);
    return updatedTransaction;
  }

  // Category methods
  async getAllCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const id = this.categoryId++;
    const newCategory: Category = { ...category, id, userId: category.userId || null };
    this.categories.set(id, newCategory);
    return newCategory;
  }
}

import { db } from './db';
import { eq, and, isNull, desc, or } from 'drizzle-orm';

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const userData = {
      ...insertUser,
      role: "user",
      createdAt: new Date(),
      email: insertUser.email || null,
      fullName: insertUser.fullName || null,
      currency: insertUser.currency || "USD",
      taxRate: insertUser.taxRate || 7.5,
      storeName: insertUser.storeName || null,
      storeAddress: insertUser.storeAddress || null,
      storePhone: insertUser.storePhone || null,
      storeEmail: insertUser.storeEmail || null,
      receiptFooter: insertUser.receiptFooter || null
    };
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }
  
  async updateUserSettings(id: number, settings: { 
    currency?: string; 
    taxRate?: number;
    storeName?: string;
    storeAddress?: string;
    storePhone?: string;
    storeEmail?: string;
    receiptFooter?: string;
  }): Promise<User | undefined> {
    // Only update the properties that are provided
    const updateData: Partial<User> = {};
    
    if (settings.currency !== undefined) {
      updateData.currency = settings.currency;
    }
    
    if (settings.taxRate !== undefined) {
      updateData.taxRate = settings.taxRate;
    }
    
    if (settings.storeName !== undefined) {
      updateData.storeName = settings.storeName;
    }
    
    if (settings.storeAddress !== undefined) {
      updateData.storeAddress = settings.storeAddress;
    }
    
    if (settings.storePhone !== undefined) {
      updateData.storePhone = settings.storePhone;
    }
    
    if (settings.storeEmail !== undefined) {
      updateData.storeEmail = settings.storeEmail;
    }
    
    if (settings.receiptFooter !== undefined) {
      updateData.receiptFooter = settings.receiptFooter;
    }
    
    // No changes to update
    if (Object.keys(updateData).length === 0) {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user;
    }
    
    const [updatedUser] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();
      
    return updatedUser;
  }

  // Product methods
  async getAllProducts(userId?: number): Promise<Product[]> {
    if (userId) {
      return db.select().from(products).where(eq(products.userId, userId));
    }
    return db.select().from(products);
  }

  async getProductById(id: number, userId?: number): Promise<Product | undefined> {
    if (userId) {
      const [product] = await db.select().from(products).where(
        and(eq(products.id, id), eq(products.userId, userId))
      );
      return product;
    }
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    // Explicitly type the object to match the target schema
    const productData: typeof products.$inferInsert = {
      ...product,
      inventory: product.inventory || 0,
      imageUrl: product.imageUrl || null,
      userId: product.userId || null
    };
    const [newProduct] = await db.insert(products).values(productData).returning();
    return newProduct;
  }

  async updateProduct(id: number, product: Partial<InsertProduct>, userId?: number): Promise<Product | undefined> {
    if (userId) {
      const [updatedProduct] = await db
        .update(products)
        .set(product)
        .where(and(eq(products.id, id), eq(products.userId, userId)))
        .returning();
      return updatedProduct;
    }
    const [updatedProduct] = await db
      .update(products)
      .set(product)
      .where(eq(products.id, id))
      .returning();
    return updatedProduct;
  }

  async deleteProduct(id: number, userId?: number): Promise<boolean> {
    let result;
    if (userId) {
      result = await db.delete(products).where(
        and(eq(products.id, id), eq(products.userId, userId))
      );
    } else {
      result = await db.delete(products).where(eq(products.id, id));
    }
    return !!result;
  }

  async getProductsByCategory(category: string, userId?: number): Promise<Product[]> {
    if (category === "All") {
      return this.getAllProducts(userId);
    }
    
    if (userId) {
      return db.select().from(products).where(
        and(eq(products.category, category), eq(products.userId, userId))
      );
    }
    return db.select().from(products).where(eq(products.category, category));
  }

  // Cart methods
  async getCartItems(transactionId?: number, userId?: number): Promise<CartItem[]> {
    const conditions = [];
    
    if (transactionId) {
      conditions.push(eq(cartItems.transactionId, transactionId));
    } else {
      conditions.push(isNull(cartItems.transactionId));
    }
    
    if (userId) {
      conditions.push(eq(cartItems.userId, userId));
    }
    
    return db.select().from(cartItems).where(and(...conditions));
  }

  async addToCart(item: InsertCartItem): Promise<CartItem> {
    // Check if this product is already in the cart for this user
    let existingItem;
    const conditions = [eq(cartItems.productId, item.productId)];
    
    if (item.transactionId) {
      conditions.push(eq(cartItems.transactionId, item.transactionId));
    } else {
      conditions.push(isNull(cartItems.transactionId));
    }
    
    if (item.userId) {
      conditions.push(eq(cartItems.userId, item.userId));
    }
    
    const [found] = await db
      .select()
      .from(cartItems)
      .where(and(...conditions));
    
    existingItem = found;

    if (existingItem) {
      // Update quantity instead of adding new item
      return this.updateCartItem(existingItem.id, existingItem.quantity + (item.quantity || 1)) as Promise<CartItem>;
    }

    // Prepare the item with appropriate defaults
    const cartItemData = {
      ...item,
      transactionId: item.transactionId || null,
      quantity: item.quantity || 1,
      userId: item.userId || null
    };
    
    const [newItem] = await db.insert(cartItems).values(cartItemData).returning();
    return newItem;
  }

  async updateCartItem(id: number, quantity: number): Promise<CartItem | undefined> {
    if (quantity <= 0) {
      await this.removeCartItem(id);
      return undefined;
    }

    const [updatedItem] = await db
      .update(cartItems)
      .set({ quantity })
      .where(eq(cartItems.id, id))
      .returning();
    return updatedItem;
  }

  async removeCartItem(id: number): Promise<boolean> {
    const result = await db.delete(cartItems).where(eq(cartItems.id, id));
    return !!result;
  }

  async clearCart(transactionId?: number, userId?: number): Promise<boolean> {
    const conditions = [];
    
    if (transactionId) {
      // Clear only items for a specific transaction
      conditions.push(eq(cartItems.transactionId, transactionId));
    } else {
      // Clear items not associated with any transaction
      conditions.push(isNull(cartItems.transactionId));
    }
    
    if (userId) {
      // Only clear items for this user
      conditions.push(eq(cartItems.userId, userId));
    }
    
    await db.delete(cartItems).where(and(...conditions));
    return true;
  }

  // Transaction methods
  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const transactionData: typeof transactions.$inferInsert = {
      ...transaction,
      status: transaction.status || null,
      completed: transaction.completed || false,
      discount: transaction.discount || null,
      discountType: transaction.discountType || null,
      cashierId: transaction.cashierId || null,
      userId: transaction.userId || null
    };
    const [newTransaction] = await db.insert(transactions).values(transactionData).returning();
    return newTransaction;
  }

  async getTransaction(id: number, userId?: number): Promise<Transaction | undefined> {
    if (userId) {
      const [transaction] = await db
        .select()
        .from(transactions)
        .where(and(eq(transactions.id, id), eq(transactions.userId, userId)));
      return transaction;
    }
    const [transaction] = await db
      .select()
      .from(transactions)
      .where(eq(transactions.id, id));
    return transaction;
  }

  async getAllTransactions(userId?: number): Promise<Transaction[]> {
    if (userId) {
      return db.select()
        .from(transactions)
        .where(eq(transactions.userId, userId))
        .orderBy(desc(transactions.date));
    }
    return db.select().from(transactions).orderBy(desc(transactions.date));
  }

  async completeTransaction(id: number, paymentMethod: string): Promise<Transaction | undefined> {
    const [updatedTransaction] = await db
      .update(transactions)
      .set({ completed: true, paymentMethod })
      .where(eq(transactions.id, id))
      .returning();
    return updatedTransaction;
  }

  // Category methods
  async getAllCategories(userId?: number): Promise<Category[]> {
    if (userId) {
      // Return both user's custom categories and "global" categories (where userId is null)
      return db.select().from(categories).where(
        or(eq(categories.userId, userId), isNull(categories.userId))
      );
    }
    return db.select().from(categories);
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const categoryData: typeof categories.$inferInsert = {
      ...category,
      userId: category.userId || null
    };
    const [newCategory] = await db.insert(categories).values(categoryData).returning();
    return newCategory;
  }
}

// Initialize the database with sample data
async function initializeDatabase() {
  // Check if we have categories
  const existingCategories = await db.select().from(categories);
  
  if (existingCategories.length === 0) {
    // Add default categories
    const defaultCategories = ["All", "Food", "Beverages", "Household", "Electronics"];
    for (const name of defaultCategories) {
      await db.insert(categories).values({ name });
    }
    
    // Add sample products
    const sampleProducts: InsertProduct[] = [
      { name: "Premium Coffee", price: 3.99, category: "Beverages", inventory: 45, imageUrl: "https://images.unsplash.com/photo-1553787762-b5f5721f3b8d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200&q=80" },
      { name: "Club Sandwich", price: 5.49, category: "Food", inventory: 28, imageUrl: "https://images.unsplash.com/photo-1512152272829-e3139592d56f?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200&q=80" },
      { name: "Paper Towels", price: 2.99, category: "Household", inventory: 60, imageUrl: "https://images.unsplash.com/photo-1594311431621-0df167499096?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200&q=80" },
      { name: "Wireless Headphones", price: 49.99, category: "Electronics", inventory: 12, imageUrl: "https://images.unsplash.com/photo-1593162711562-9e0af20c8a3b?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200&q=80" },
      { name: "Potato Chips", price: 1.49, category: "Food", inventory: 87, imageUrl: "https://images.unsplash.com/photo-1561736778-92e52a7769ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200&q=80" },
      { name: "Chocolate Bar", price: 2.25, category: "Food", inventory: 52, imageUrl: "https://images.unsplash.com/photo-1560624052-449f5ddf0c31?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200&q=80" },
      { name: "Bottled Water", price: 0.99, category: "Beverages", inventory: 124, imageUrl: "https://images.unsplash.com/photo-1610885634663-71f958364a6b?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200&q=80" },
      { name: "AA Batteries (4pk)", price: 3.49, category: "Electronics", inventory: 35, imageUrl: "https://images.unsplash.com/photo-1582452932537-6dbb452652c8?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200&q=80" },
    ];
    
    for (const product of sampleProducts) {
      await db.insert(products).values(product);
    }
  }
}

// Initialize the database
initializeDatabase().catch(console.error);

export const storage = new DatabaseStorage();
