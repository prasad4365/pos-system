// Global TypeScript interfaces and type definitions for the POS System

export interface Category {
  id: string;
  name: string;
  products?: Product[];
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode?: string | null;
  price: number;
  costPrice: number;
  stock: number;
  categoryId: string;
  category?: Category;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  product?: Product;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  totalAmount: number;
  payableAmount: number;
  paymentMethod: string;
  userId: string;
  items: OrderItem[];
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "CASHIER";
  createdAt: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

// Full order shape returned by POST /api/orders (includes product names for receipt)
export interface OrderResponse {
  id: string;
  orderNumber: string;
  totalAmount: number;
  payableAmount: number;
  paymentMethod: string;
  createdAt: string;
  user?: { name: string };
  items: {
    id: string;
    quantity: number;
    unitPrice: number;
    product: { name: string; sku: string };
  }[];
}
