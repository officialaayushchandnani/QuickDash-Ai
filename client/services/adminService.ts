import { Product } from "@/contexts/CartContext";
import { Customer, DeliveryAgent, Zone, Order } from "@/types";

const API_BASE_URL = '/api';

// This is the single, complete, and final API service object.
export const api = {
  /**
   * Fetches all products from the backend database.
   */
  getProducts: async (): Promise<Product[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/products`);
      if (!response.ok) {
        throw new Error(`API error! status: ${response.status}`);
      }
      const data = await response.json();
      // Ensure the response is actually an array before returning
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("API Error: Failed to fetch products:", error);
      // Return an empty array on any failure to prevent crashing the app
      return [];
    }
  },

  /**
   * Sends a new product to the backend to be saved in the database.
   */
  addNewProduct: async (productData: Partial<Product>): Promise<Product> => {
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to create product' }));
      throw new Error(errorData.message);
    }
    return response.json();
  },

  /**
   * Fetches all categories.
   */
  getCategories: async (): Promise<any[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/categories`);
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      return data; // Return full category objects
    } catch (error) {
      console.error("API Error:", error);
      return [];
    }
  },

  /**
   * Adds a new category.
   */
  addCategory: async (name: string): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to add category');
    }
    return response.json();
  },

  updateProduct: async (productId: string, productData: Partial<Product>): Promise<Product> => {
    const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to update product' }));
      throw new Error(errorData.message);
    }
    return response.json();
  },
  getProductById: async (id: string): Promise<Product | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}`);
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`API error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`API Error: Failed to fetch product ${id}:`, error);
      return null;
    }
  },

  deleteProduct: async (productId: string): Promise<void> => {
    try {
      console.log(`[API] Sending DELETE request for product: ${productId}`);
      const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        let errorMessage = 'Failed to delete product';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
          console.error(`[API] Delete failed (Status ${response.status}):`, errorData);
        } catch (e) {
          const textError = await response.text();
          console.error(`[API] Delete failed (Status ${response.status}), non-JSON response:`, textError);
        }
        throw new Error(errorMessage);
      }
      console.log(`[API] Product ${productId} deleted successfully.`);
    } catch (error) {
      console.error(`[API] Delete product network/service error:`, error);
      throw error;
    }
  },


  /**
   * Fetches all orders from the backend database.

   */
  getOrders: async (): Promise<Order[]> => {
    try {
      // FIX: Use the new admin-specific endpoint for all orders
      const response = await fetch(`${API_BASE_URL}/orders/all`);
      if (!response.ok) throw new Error('Failed to fetch orders');
      return await response.json();
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      return [];
    }
  },

  /**
   * Fetches dashboard summary statistics (revenue, total orders, recent orders).
   */
  getDashboardOverview: async (): Promise<{ totalOrders: number; totalRevenue: number; recentOrders: any[] }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/stats/overview`);
      if (!response.ok) throw new Error('Failed to fetch dashboard overview');
      return await response.json();
    } catch (error) {
      console.error("Failed to fetch dashboard overview:", error);
      return { totalOrders: 0, totalRevenue: 0, recentOrders: [] };
    }
  },

  /**
   * Assigns a delivery partner to an order.
   */
  assignOrder: async (orderId: string, deliveryPartnerId: string): Promise<Order> => {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/assign`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deliveryPartnerId }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to assign order' }));
      throw new Error(errorData.message);
    }
    return response.json();
  },

  /**
   * Fetches all customers from the backend database.
   */
  getCustomers: async (): Promise<Customer[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/customers`);
      if (!response.ok) throw new Error('Failed to fetch customers');
      return await response.json();
    } catch (error) { console.error("API Error:", error); return []; }
  },

  /**
   * Fetches a single customer by ID from the backend database.
   */
  getCustomerById: async (id: string): Promise<Customer | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/customers/${id}`);
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error('Failed to fetch customer');
      }
      return await response.json();
    } catch (error) { console.error("API Error:", error); return null; }
  },

  /**
   * Fetches all delivery agents from the backend database.
   */
  getDeliveryAgents: async (): Promise<DeliveryAgent[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/agents`);
      if (!response.ok) throw new Error('Failed to fetch delivery agents');
      return await response.json();
    } catch (error) { console.error("API Error:", error); return []; }
  },

  /**
   * Toggles an agent's status between Active and Inactive.
   */
  toggleAgentStatus: async (agentId: string): Promise<{ id: string; status: string }> => {
    const response = await fetch(`${API_BASE_URL}/agents/${agentId}/toggle-status`, {
      method: 'PATCH',
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to toggle agent status' }));
      throw new Error(errorData.message);
    }
    return response.json();
  },
  /**
   * Fetches all delivery zones from the backend database.
   */
  getZones: async (): Promise<Zone[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/zones`);
      if (!response.ok) throw new Error('Failed to fetch zones');
      return await response.json();
    } catch (error) { console.error("API Error:", error); return []; }
  },

  /**
   * FIX: Simulates an AI call to generate a product description.
   * This function is now correctly part of the exported 'api' object.
   */
  generateProductDescription: async (productInfo: {
    name: string;
    category: string;
    company?: string;
    size?: string;
  }): Promise<string> => {
    await new Promise(res => setTimeout(res, 1500));
    const { name, category, company, size } = productInfo;
    const templates = {
      dairy: [`Premium ${name} ${company ? `from ${company}` : 'from trusted dairy farms'}. Rich in calcium and vitamins. ${size ? `Packed in a ${size} container` : ''}. Perfect for your daily needs.`,],
      fruits: [`Juicy and sweet ${name}, hand-picked for ripeness. ${company ? `From ${company}` : 'Sourced from the best orchards'}. A great source of vitamins. ${size ? `Available as a ${size} bunch` : ''}.`,],
      vegetables: [`Crisp and fresh ${name}, delivered to your doorstep. Perfect for healthy meals. ${size ? `This ${size} bag` : ''} is great for your recipes.`,],
      bakery: [`Freshly baked ${name} with a delicious taste. ${company ? `A classic from ${company}` : 'Made with premium ingredients'}. Perfect for sandwiches or toast. ${size ? `This ${size} loaf` : ''} is ideal for families.`,],
      default: [`A high-quality ${name} ${company ? `from the brand ${company}` : ''}. ${size ? `Available in a ${size} size` : ''}. A versatile item for every household.`,]
    };
    const categoryKey = category.toLowerCase();
    let selectedTemplates = templates.default;
    for (const key in templates) {
      if (categoryKey.includes(key)) {
        selectedTemplates = templates[key as keyof typeof templates];
        break;
      }
    }
    const randomTemplate = selectedTemplates[Math.floor(Math.random() * selectedTemplates.length)];
    return randomTemplate + " Delivered fast to your home.";
  }
};