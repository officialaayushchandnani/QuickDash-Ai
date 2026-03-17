import { CartItem } from '@/contexts/CartContext';
import { DeliveryAddress } from './checkoutService';
import { Order, OrderItem } from '@/types';

// --- Type Definitions ---
// Uses central types from '@/types'

// --- API Service ---
export const orderApi = {
  /**
   * Fetches all orders for the current user.
   */
  getOrdersForUser: async (userId: string): Promise<Order[]> => {
    if (!userId) return []; // Don't make a request if there's no user ID

    // We send the userId as a query parameter in the URL
    const response = await fetch(`/api/orders?userId=${userId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch orders');
    }
    return response.json();
  },

  /**
   * Places a new order by sending it to the backend.
   */
  placeNewOrder: async (orderData: {
    cart: CartItem[],
    costs: any,
    address?: DeliveryAddress,
    paymentMethod: string,
    userId: string, // Added userId
    customerName: string // Added customerName
  }): Promise<{ success: boolean; orderId: string; error?: string }> => {

    if (!orderData.address) {
      return { success: false, orderId: '' };
    }

    const payload = {
      userId: orderData.userId,
      customerName: orderData.customerName,
      items: orderData.cart.map(item => ({
        productId: item.product._id || item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        image: item.product.image
      })),
      subtotal: orderData.costs.subtotal,
      deliveryFee: orderData.costs.deliveryFee,
      tax: orderData.costs.tax,
      discount: orderData.costs.discount,
      total: orderData.costs.total,
      deliveryAddress: orderData.address.address,
      paymentMethod: orderData.paymentMethod,
    };

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to place order');
      }

      const createdOrder = await response.json();
      return { success: true, orderId: createdOrder.orderNumber };
    } catch (error: any) {
      console.error("Place Order Error:", error);
      return { success: false, orderId: '', error: error.message };
    }
  }
};