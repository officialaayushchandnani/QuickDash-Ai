/**
 * This file contains central configuration and business logic for the application.
 * It is the "single source of truth" for values like pricing and fees, ensuring
 * consistency between the frontend and backend.
 */
export const PRICING_RULES = {
  /**
   * The standard delivery fee in rupees for orders that do not qualify for free shipping.
   */
  DELIVERY_FEE: 40,

  /**
   * The minimum order subtotal in rupees to qualify for free delivery.
   */
  FREE_DELIVERY_THRESHOLD: 199,

  /**
   * The tax rate applied to the order subtotal, expressed as a percentage.
   */
  TAX_RATE_PERCENT: 5,
};