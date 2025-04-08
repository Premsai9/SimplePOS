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

  // Product methods
  getAllProducts(): Promise<Product[]>;
  getProductById(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  getProductsByCategory(category: string): Promise<Product[]>;

  // Cart methods
  getCartItems(transactionId?: number): Promise<CartItem[]>;
  addToCart(item: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: number, quantity: number): Promise<CartItem | undefined>;
  removeCartItem(id: number): Promise<boolean>;
  clearCart(transactionId?: number): Promise<boolean>;

  // Transaction methods
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getTransaction(id: number): Promise<Transaction | undefined>;
  getAllTransactions(): Promise<Transaction[]>;
  completeTransaction(id: number, paymentMethod: string): Promise<Transaction | undefined>;

  // Category methods
  getAllCategories(): Promise<Category[]>;
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
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
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
    const newProduct: Product = { ...product, id };
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
    const existingItems = await this.getCartItems(item.transactionId);
    const existingItem = existingItems.find(i => i.productId === item.productId);

    if (existingItem) {
      // Update quantity instead of adding new item
      return this.updateCartItem(existingItem.id, existingItem.quantity + (item.quantity || 1)) as Promise<CartItem>;
    }

    const id = this.cartItemId++;
    const newItem: CartItem = { ...item, id };
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
    const newTransaction: Transaction = { ...transaction, id, date };
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
    const newCategory: Category = { ...category, id };
    this.categories.set(id, newCategory);
    return newCategory;
  }
}

export const storage = new MemStorage();
