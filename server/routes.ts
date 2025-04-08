import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertCartItemSchema, 
  insertProductSchema,
  insertTransactionSchema,
  insertCategorySchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Define API routes
  const apiRouter = express.Router();

  // Products API
  apiRouter.get("/products", async (req: Request, res: Response) => {
    const category = req.query.category as string;
    let products;
    
    if (category && category !== "All") {
      products = await storage.getProductsByCategory(category);
    } else {
      products = await storage.getAllProducts();
    }
    
    res.json(products);
  });

  apiRouter.get("/products/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const product = await storage.getProductById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  });

  apiRouter.post("/products", async (req: Request, res: Response) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid product data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  apiRouter.put("/products/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    try {
      const productData = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(id, productData);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid product data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update product" });
    }
  });

  apiRouter.delete("/products/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const result = await storage.deleteProduct(id);
    if (!result) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(204).end();
  });

  // Cart API
  apiRouter.get("/cart", async (_req: Request, res: Response) => {
    const cartItems = await storage.getCartItems();
    
    // Get product details for each cart item
    const itemsWithDetails = await Promise.all(
      cartItems.map(async (item) => {
        const product = await storage.getProductById(item.productId);
        return {
          ...item,
          product,
        };
      })
    );
    
    res.json(itemsWithDetails);
  });

  apiRouter.post("/cart", async (req: Request, res: Response) => {
    try {
      const cartItemData = insertCartItemSchema.parse(req.body);
      
      // Verify product exists and has enough inventory
      const product = await storage.getProductById(cartItemData.productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      if (product.inventory < cartItemData.quantity) {
        return res.status(400).json({ 
          message: `Not enough inventory. Only ${product.inventory} available.` 
        });
      }
      
      // Use the current product price if not specified
      if (!cartItemData.price) {
        cartItemData.price = product.price;
      }
      
      const cartItem = await storage.addToCart(cartItemData);
      
      // Get the full item with product details
      const fullItem = {
        ...cartItem,
        product,
      };
      
      res.status(201).json(fullItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid cart item data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to add item to cart" });
    }
  });

  apiRouter.put("/cart/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid cart item ID" });
    }

    const { quantity } = req.body;
    if (typeof quantity !== 'number') {
      return res.status(400).json({ message: "Quantity must be a number" });
    }

    // Get the cart item to check product inventory
    const existingItem = Array.from(await storage.getCartItems())
      .find(item => item.id === id);
    
    if (!existingItem) {
      return res.status(404).json({ message: "Cart item not found" });
    }
    
    // If increasing quantity, check inventory
    if (quantity > existingItem.quantity) {
      const product = await storage.getProductById(existingItem.productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      const additionalQuantity = quantity - existingItem.quantity;
      if (product.inventory < additionalQuantity) {
        return res.status(400).json({ 
          message: `Not enough inventory. Only ${product.inventory} additional units available.` 
        });
      }
    }

    try {
      const updatedItem = await storage.updateCartItem(id, quantity);
      
      if (!updatedItem) {
        if (quantity <= 0) {
          return res.status(200).json({ message: "Item removed from cart" });
        }
        return res.status(404).json({ message: "Cart item not found" });
      }
      
      // Get product details
      const product = await storage.getProductById(updatedItem.productId);
      
      const fullItem = {
        ...updatedItem,
        product,
      };
      
      res.json(fullItem);
    } catch (error) {
      res.status(500).json({ message: "Failed to update cart item" });
    }
  });

  apiRouter.delete("/cart/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid cart item ID" });
    }

    const result = await storage.removeCartItem(id);
    if (!result) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    res.status(204).end();
  });

  apiRouter.delete("/cart", async (_req: Request, res: Response) => {
    await storage.clearCart();
    res.status(204).end();
  });

  // Transactions API
  apiRouter.get("/transactions", async (_req: Request, res: Response) => {
    const transactions = await storage.getAllTransactions();
    res.json(transactions);
  });

  apiRouter.get("/transactions/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid transaction ID" });
    }

    const transaction = await storage.getTransaction(id);
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    // Get cart items for this transaction
    const items = await storage.getCartItems(id);
    
    // Get product details for each item
    const itemsWithDetails = await Promise.all(
      items.map(async (item) => {
        const product = await storage.getProductById(item.productId);
        return {
          ...item,
          product,
        };
      })
    );

    res.json({
      ...transaction,
      items: itemsWithDetails,
    });
  });

  apiRouter.post("/transactions", async (req: Request, res: Response) => {
    try {
      const transactionData = insertTransactionSchema.parse(req.body);
      
      // Create the transaction
      const transaction = await storage.createTransaction(transactionData);
      
      // Get current cart items
      const cartItems = await storage.getCartItems();
      
      // Associate cart items with the transaction
      for (const item of cartItems) {
        await storage.updateCartItem(item.id, item.quantity);
        
        // Update product inventory
        const product = await storage.getProductById(item.productId);
        if (product) {
          await storage.updateProduct(product.id, {
            inventory: product.inventory - item.quantity
          });
        }
      }
      
      res.status(201).json(transaction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid transaction data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create transaction" });
    }
  });

  apiRouter.put("/transactions/:id/complete", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid transaction ID" });
    }

    const { paymentMethod } = req.body;
    if (typeof paymentMethod !== 'string') {
      return res.status(400).json({ message: "Payment method is required" });
    }

    try {
      const transaction = await storage.completeTransaction(id, paymentMethod);
      
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      
      res.json(transaction);
    } catch (error) {
      res.status(500).json({ message: "Failed to complete transaction" });
    }
  });

  // Categories API
  apiRouter.get("/categories", async (_req: Request, res: Response) => {
    const categories = await storage.getAllCategories();
    res.json(categories);
  });

  apiRouter.post("/categories", async (req: Request, res: Response) => {
    try {
      const categoryData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(categoryData);
      res.status(201).json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid category data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create category" });
    }
  });

  // Register API router with prefix
  app.use("/api", apiRouter);

  const httpServer = createServer(app);
  return httpServer;
}
