export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  inventory: number;
  imageUrl?: string;
}

export interface CartItem {
  id: number;
  productId: number;
  quantity: number;
  price: number;
  transactionId?: number;
  product?: Product;
}

export interface Transaction {
  id: number;
  date: Date;
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: string;
  cashierId?: number;
  completed: boolean;
  items?: CartItem[];
}

export interface Category {
  id: number;
  name: string;
}

export interface PaymentForm {
  amountTendered: number;
  paymentMethod: string;
}
