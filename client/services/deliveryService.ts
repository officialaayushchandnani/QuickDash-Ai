// This file connects the delivery dashboard to the backend API.

const API_BASE_URL = '/api';

// --- Type Definitions for our data ---
export interface DeliveryCustomer {
  name: string;
  phone: string;
  email: string;
  address: string;
  coordinates: { lat: number; lng: number };
}

export interface Delivery {
  id: string; // This will map to orderNumber or _id
  _id: string; // MongoDB ID
  customer: DeliveryCustomer;
  items: string[];
  amount: number;
  expectedEarnings: number;
  status: "Assigned" | "Accepted" | "Picked Up" | "Delivered" | "Rejected";
  estimatedTime: string;
  specialInstructions: string;
  completedAt?: Date;
}

export interface RecentCompletion {
  id: string;
  time: string;
  earnings: number;
  duration: string;
}

// --- Status Mapping Helpers ---
// Mapping backend status -> frontend delivery status
const mapBackendStatus = (status: string): Delivery['status'] => {
  switch (status) {
    case 'preparing': return 'Assigned';
    case 'accepted': return 'Accepted';
    case 'out_for_delivery': return 'Picked Up';
    case 'delivered': return 'Delivered';
    case 'cancelled': return 'Rejected';
    default: return 'Assigned';
  }
};

const mapFrontendStatus = (status: Delivery['status']): string => {
  switch (status) {
    case 'Assigned': return 'preparing';
    case 'Accepted': return 'accepted';
    case 'Picked Up': return 'out_for_delivery';
    case 'Delivered': return 'delivered';
    case 'Rejected': return 'cancelled';
    default: return 'preparing';
  }
};


// --- API Functions ---
export const deliveryApi = {
  /**
   * Fetches the current list of active deliveries for the agent.
   */
  getActiveDeliveries: async (agentId: string): Promise<Delivery[]> => {
    try {
      if (!agentId) return [];
      const response = await fetch(`${API_BASE_URL}/orders/agent/${agentId}`);
      if (!response.ok) throw new Error('Failed to fetch deliveries');
      const orders = await response.json();

      return orders.map((order: any) => ({
        id: order.orderNumber,
        _id: order._id,
        customer: {
          name: order.userId?.name || order.customerName || "Customer",
          phone: order.userId?.phone || "+91 00000 00000",
          email: order.userId?.email || "customer@email.com",
          address: order.deliveryAddress,
          coordinates: { lat: 23.0225, lng: 72.5714 } // Mock coordinates for now
        },
        items: order.items.map((i: any) => i.name),
        amount: order.total,
        expectedEarnings: Math.round(order.total * 0.05 + 20),
        status: mapBackendStatus(order.status),
        estimatedTime: "20 mins",
        specialInstructions: order.specialInstructions || "Handle with care",
      }));
    } catch (error) {
      console.error("API Error:", error);
      return [];
    }
  },

  /**
   * Updates an order's status in the backend.
   */
  updateOrderStatus: async (orderId: string, status: Delivery['status']): Promise<void> => {
    try {
      const backendStatus = mapFrontendStatus(status);
      console.log(`[SERVICE] Updating order ${orderId} to backend status: ${backendStatus}`);

      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: backendStatus }),
      });

      if (!response.ok) {
        let errorMsg = 'Failed to update status';
        try {
          const data = await response.json();
          errorMsg = data.message || errorMsg;
          console.error(`[SERVICE] PATCH failed with status ${response.status}:`, data);
        } catch (e) {
          const text = await response.text();
          console.error(`[SERVICE] PATCH failed with status ${response.status}, raw response:`, text);
        }
        throw new Error(errorMsg);
      }
      console.log(`[SERVICE] Successfully updated order ${orderId} to ${status}`);
    } catch (error: any) {
      console.error(`[SERVICE] updateOrderStatus error:`, error);
      throw error;
    }
  },


  /**
   * Fetches the agent's recently completed deliveries.
   */
  getRecentCompletions: async (agentId: string): Promise<RecentCompletion[]> => {
    try {
      if (!agentId) return [];
      // For completions, we could filter by 'delivered' status
      const response = await fetch(`${API_BASE_URL}/orders/agent/${agentId}`);
      if (!response.ok) throw new Error('Failed to fetch completions');
      const orders = await response.json();

      return orders
        .filter((o: any) => o.status === 'delivered')
        .slice(0, 5)
        .map((o: any) => ({
          id: o.orderNumber,
          customerName: o.userId?.name || o.customerName || "Customer",
          time: new Date(o.updatedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          earnings: Math.round(o.total * 0.05 + 20),
          duration: "15 min"
        }));
    } catch (error) {
      console.error("Error fetching completions:", error);
      return [];
    }
  },

  /**
   * Opens Google Maps for navigation to a customer's location.
   */
  startNavigation: (customer: DeliveryCustomer): void => {
    const { lat, lng } = customer.coordinates;
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(googleMapsUrl, "_blank");
  },

  /**
   * Initiates a phone call to the customer.
   */
  callCustomer: (phoneNumber: string): void => {
    window.location.href = `tel:${phoneNumber}`;
  },
};
