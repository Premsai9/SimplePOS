import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Product, CartItem, Transaction, Category, PaymentForm } from "@/lib/types";

const TAX_RATE = 0.08; // 8% tax rate

export function usePOS() {
  // State
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isPaymentModalOpen, setPaymentModalOpen] = useState<boolean>(false);
  const [isReceiptModalOpen, setReceiptModalOpen] = useState<boolean>(false);
  const [currentTransaction, setCurrentTransaction] = useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState({
    products: false,
    cart: false,
    payment: false,
    error: false,
    errorMessage: "",
  });

  // Queries
  const { data: products = [], isLoading: isProductsLoading } = useQuery({
    queryKey: ["/api/products", selectedCategory],
    select: (data: Product[]) => {
      if (!searchQuery) return data;
      const query = searchQuery.toLowerCase();
      return data.filter(product => 
        product.name.toLowerCase().includes(query) || 
        product.category.toLowerCase().includes(query)
      );
    }
  });

  const { data: categories = [], isLoading: isCategoriesLoading } = useQuery({
    queryKey: ["/api/categories"],
  });

  const { data: cartItems = [], isLoading: isCartLoading } = useQuery({
    queryKey: ["/api/cart"],
  });

  // Calculations
  const cartSubtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartTax = cartSubtotal * TAX_RATE;
  const cartTotal = cartSubtotal + cartTax;

  // Mutations
  const addToCartMutation = useMutation({
    mutationFn: (product: Product) => {
      return apiRequest("POST", "/api/cart", {
        productId: product.id,
        quantity: 1,
        price: product.price,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
    onError: (error: Error) => {
      setIsLoading(prev => ({
        ...prev,
        error: true,
        errorMessage: error.message,
      }));
    },
  });

  const updateCartItemMutation = useMutation({
    mutationFn: ({ id, quantity }: { id: number; quantity: number }) => {
      return apiRequest("PUT", `/api/cart/${id}`, { quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
    onError: (error: Error) => {
      setIsLoading(prev => ({
        ...prev,
        error: true,
        errorMessage: error.message,
      }));
    },
  });

  const removeCartItemMutation = useMutation({
    mutationFn: (id: number) => {
      return apiRequest("DELETE", `/api/cart/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
    onError: (error: Error) => {
      setIsLoading(prev => ({
        ...prev,
        error: true,
        errorMessage: error.message,
      }));
    },
  });

  const clearCartMutation = useMutation({
    mutationFn: () => {
      return apiRequest("DELETE", "/api/cart");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
    onError: (error: Error) => {
      setIsLoading(prev => ({
        ...prev,
        error: true,
        errorMessage: error.message,
      }));
    },
  });

  const createTransactionMutation = useMutation({
    mutationFn: (paymentMethod: string) => {
      return apiRequest("POST", "/api/transactions", {
        subtotal: cartSubtotal,
        tax: cartTax,
        total: cartTotal,
        paymentMethod,
        completed: true,
      });
    },
    onSuccess: async (response) => {
      const transaction = await response.json();
      
      // Fetch the complete transaction with items
      const fullTransaction = await fetchTransaction(transaction.id);
      setCurrentTransaction(fullTransaction);
      
      // Show receipt modal
      setPaymentModalOpen(false);
      setReceiptModalOpen(true);
      
      // Clear cart after successful transaction
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
    onError: (error: Error) => {
      setIsLoading(prev => ({
        ...prev,
        error: true,
        errorMessage: error.message,
      }));
    },
  });

  // Helper functions
  const fetchTransaction = async (id: number): Promise<Transaction> => {
    const response = await fetch(`/api/transactions/${id}`);
    if (!response.ok) {
      throw new Error("Failed to fetch transaction");
    }
    return response.json();
  };

  // Action handlers
  const addToCart = useCallback((product: Product) => {
    addToCartMutation.mutate(product);
  }, [addToCartMutation]);

  const updateCartItem = useCallback((id: number, quantity: number) => {
    updateCartItemMutation.mutate({ id, quantity });
  }, [updateCartItemMutation]);

  const removeCartItem = useCallback((id: number) => {
    removeCartItemMutation.mutate(id);
  }, [removeCartItemMutation]);

  const clearCart = useCallback(() => {
    clearCartMutation.mutate();
  }, [clearCartMutation]);

  const processPayment = useCallback((payment: PaymentForm) => {
    setIsLoading(prev => ({ ...prev, payment: true }));
    createTransactionMutation.mutate(payment.paymentMethod);
  }, [createTransactionMutation]);

  const completeSale = useCallback(() => {
    setCurrentTransaction(null);
    setReceiptModalOpen(false);
    clearCart();
  }, [clearCart]);

  // Update loading states
  useEffect(() => {
    setIsLoading(prev => ({
      ...prev,
      products: isProductsLoading,
      cart: isCartLoading,
      payment: createTransactionMutation.isPending,
    }));
  }, [isProductsLoading, isCartLoading, createTransactionMutation.isPending]);

  return {
    // Data
    products,
    categories,
    cartItems,
    selectedCategory,
    searchQuery,
    cartSubtotal,
    cartTax,
    cartTotal,
    isPaymentModalOpen,
    isReceiptModalOpen,
    currentTransaction,
    isLoading,

    // Actions
    setSelectedCategory,
    setSearchQuery,
    addToCart,
    updateCartItem,
    removeCartItem,
    clearCart,
    setPaymentModalOpen,
    setReceiptModalOpen,
    processPayment,
    completeSale,
  };
}
