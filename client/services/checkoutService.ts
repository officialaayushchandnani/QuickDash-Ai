import { User } from '@/contexts/AuthContext';

// This file handles data and business logic for the checkout process.

export interface DeliveryAddress {
  id: string;
  type: "home" | "work" | "other";
  name: string;
  address: string;
  landmark?: string;
  phone: string;
  isDefault: boolean;
}

interface Coupon {
  code: string;
  discount: number;
  description: string;
  minSpend?: number; 
}

const coupons: { [key: string]: Coupon } = {
  "EXTRA5": { code: "EXTRA5", discount: 5, description: "5% off on your order" },
  "WELCOME10": { code: "WELCOME10", discount: 10, description: "10% off for new customers" },
  "SAVE15": { code: "SAVE15", discount: 15, description: "15% off on orders above ₹500", minSpend: 500 }
};

export const checkoutApi = {
  /**
   * Gets the delivery address from the logged-in user object.
   * In a real app, this would be an API call to fetch all saved addresses for a user.
   */
  getAddresses: async (user: User | null): Promise<DeliveryAddress[]> => {
    await new Promise(res => setTimeout(res, 300)); // Simulate API delay
    
    if (user && user.address && user.phone) {
      // Create a "Home" address from the user's profile data
      const userAddress: DeliveryAddress = {
        id: 'user_home_address',
        type: 'home',
        name: `${user.name}'s Home`,
        address: user.address,
        phone: user.phone,
        isDefault: true,
      };
      return [userAddress];
    }
    
    // Return an empty array if there is no user or they have no address
    return [];
  },

  /**
   * Validates a coupon code and returns the coupon details or an error message.
   */
  validateCoupon: (code: string, subtotal: number): { coupon?: Coupon; error?: string } => {
    const coupon = coupons[code.toUpperCase() as keyof typeof coupons];
    if (!coupon) {
      return { error: "Invalid coupon code" };
    }
    if (coupon.minSpend && subtotal < coupon.minSpend) {
      return { error: `This coupon is valid only on orders above ₹${coupon.minSpend}` };
    }
    return { coupon };
  },
  
  /**
   * Simulates placing the final order.
   */
  placeOrder: async (orderDetails: any): Promise<{ success: boolean; orderId: string }> => {
    console.log("Placing order with details:", orderDetails);
    await new Promise(res => setTimeout(res, 2000)); // Simulate payment processing
    return { success: true, orderId: `QD${Date.now()}` };
  }
};