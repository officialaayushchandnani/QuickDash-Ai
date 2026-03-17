// This file contains central TypeScript type definitions to be used across the application,
// both on the client-side and server-side, ensuring data consistency.

import { CartItem as CICartItem } from "../contexts/CartContext.tsx";

// Re-exporting CartItem to be available from this central file if needed
export type CartItem = CICartItem;

// Defines the shape of a single Product
export interface Product {
  id: string;
  _id?: string; // MongoDB ID
  name: string;
  price: number;
  image: string;
  category: string;
  description: string;
  stock: number;
  deliveryTime: string;
  rating: number;
  reviews: number;
  company?: string;
  size?: string;
  tags?: string[];
}

// Defines the shape of a single Customer record
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  orders: number;
  totalSpent: number;
  joinDate: string;
  status: "Active" | "VIP";
  address: string;
  lastOrder: string;
  favoriteCategory: string;
  recentOrders: { id: string; date: string; amount: number; status: string }[];
}

// Defines the shape of a single Delivery Agent record
export interface DeliveryAgent {
  id: string;
  _id?: string; // MongoDB ID
  name: string;
  email: string;
  phone: string;
  vehicleNumber: string;
  address: string;
  joinDate: string;
  status: 'available' | 'idle' | 'busy' | 'offline' | 'Active' | 'Inactive';
  totalDeliveries: number;
  rating: number;
  earnings: number;
}

// Defines the shape of a Delivery Zone
export interface Zone {
  id: string;
  name: string;
  area: string;
  deliveryTime: string;
  isActive: boolean;
  radius: string;
  orders: number;
}

// Defines the shape of an Order Item (a product within an order)
export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

// Defines the shape of a Customer Order
export interface Order {
  id: string;
  _id?: string; // MongoDB ID
  userId?: string | { _id: string; name: string }; // User ID (string or populated object)
  orderNumber: string;
  date?: string;
  status: "pending" | "confirmed" | "preparing" | "accepted" | "out_for_delivery" | "delivered" | "cancelled";

  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  tax: number;
  discount: number;
  total: number;
  customerName?: string; // Make optional as it might not be on every order object
  deliveryAddress: string;
  paymentMethod: string;
  createdAt?: string;
  updatedAt?: string;
  deliveryPartner?: string | { _id: string; name: string; email: string; phone: string; rating: number; };
  estimatedDelivery?: string;
}
