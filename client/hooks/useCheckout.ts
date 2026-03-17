import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { checkoutApi, DeliveryAddress } from "@/services/checkoutService";
import { orderApi } from "@/services/orderService";
import { toast } from "sonner";
import { PRICING_RULES } from "@/config/appConfig";

/**
 * A custom hook to manage the entire state and logic for the checkout process.
 * This encapsulates all complexity, keeping the UI component clean.
 */
export function useCheckout() {
  const { user } = useAuth(); // Get the currently logged-in user
  const { items: cart, totalPrice: subtotal, clearCart } = useCart();
  const navigate = useNavigate();

  // State for addresses and the 'Add Address' modal
  const [addresses, setAddresses] = useState<DeliveryAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [isAddAddressOpen, setIsAddAddressOpen] = useState(false);

  // State for payment and order status
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  // State for coupon logic
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string, discount: number } | null>(null);
  const [couponError, setCouponError] = useState("");

  // This effect fetches the user's addresses. It re-runs if the user logs in or out.
  useEffect(() => {
    // Pass the logged-in user to the API call to get their specific address.
    checkoutApi.getAddresses(user).then(data => {
      setAddresses(data);
      const defaultAddress = data.find(addr => addr.isDefault);
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id);
      } else {
        setSelectedAddressId(null); // Clear selection if no default
      }
    });
  }, [user]);

  // Show warning when Razorpay is selected
  useEffect(() => {
    if (paymentMethod === 'razorpay') {
      alert("Demo Mode Active\n\nCurrently you are on Demo Mode. Razorpay cannot be started in Demo Mode. Please use Cash on Delivery.");
      setPaymentMethod('cod');
    }
  }, [paymentMethod]);

  // All price calculations are memoized for performance.
  const costs = useMemo(() => {
    const deliveryFee = subtotal >= PRICING_RULES.FREE_DELIVERY_THRESHOLD ? 0 : PRICING_RULES.DELIVERY_FEE;
    const tax = Math.round(subtotal * (PRICING_RULES.TAX_RATE_PERCENT / 100));
    const discount = appliedCoupon ? Math.round(subtotal * appliedCoupon.discount / 100) : 0;
    const total = subtotal + deliveryFee + tax - discount;
    return { subtotal, deliveryFee, tax, discount, total };
  }, [subtotal, appliedCoupon]);

  // Handler to add a new address to the list
  const handleAddNewAddress = (newAddressData: Omit<DeliveryAddress, 'id' | 'type' | 'isDefault'>) => {
    const newAddress: DeliveryAddress = {
      ...newAddressData,
      id: `temp_${Date.now()}`,
      type: 'other',
      isDefault: false,
    };
    setAddresses(prev => [...prev, newAddress]);
    setSelectedAddressId(newAddress.id);
    setIsAddAddressOpen(false);
    toast.success("New address added successfully!");
  };

  // Handler for applying a coupon code
  const handleApplyCoupon = () => {
    setCouponError("");
    const { coupon, error } = checkoutApi.validateCoupon(couponCode, costs.subtotal);

    if (error) {
      setCouponError(error);
      return;
    }
    if (coupon) {
      setAppliedCoupon(coupon);
      const discountAmount = Math.round(costs.subtotal * coupon.discount / 100);
      toast.success(`Coupon '${coupon.code}' applied! You saved ₹${discountAmount}`);
    }
  };

  // Handler for removing an applied coupon
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
    toast.info("Coupon removed");
  };

  // An improved handler for the coupon input that also clears errors
  const handleCouponCodeChange = (code: string) => {
    setCouponCode(code.toUpperCase());
    if (couponError) {
      setCouponError("");
    }
  };

  // The main function to handle the final order placement
  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      toast.error("Please select a delivery address.");
      return;
    }

    if (!user || !user.id) {
      toast.error("Please log in to place an order.");
      return;
    }
    // Start processing
    setIsProcessing(true);
    const result: { success: boolean; orderId: string; error?: string } = await orderApi.placeNewOrder({
      cart,
      costs,
      paymentMethod,
      address: addresses.find(a => a.id === selectedAddressId),
      userId: user?.id || "",
      customerName: user?.name || "Guest"
    });

    if (result.success) {
      clearCart();
      setOrderPlaced(true);
      toast.success("Payment successful! Order placed.", {
        description: `Your order number is ${result.orderId}`,
      });
      setTimeout(() => navigate("/orders", { state: { newOrderId: result.orderId }, replace: true }), 3000);
    } else {
      toast.error(`Order failed: ${result.error || "Please try again."}`);
      setIsProcessing(false);
    }
  };

  // The "public interface" of our hook
  return {
    cart,
    costs,
    addresses,
    selectedAddressId,
    setSelectedAddressId,
    paymentMethod,
    setPaymentMethod,
    isProcessing,
    orderPlaced,
    handlePlaceOrder,
    addressModal: {
      isOpen: isAddAddressOpen,
      open: () => setIsAddAddressOpen(true),
      close: () => setIsAddAddressOpen(false),
      save: handleAddNewAddress,
    },
    coupon: {
      code: couponCode,
      setCode: handleCouponCodeChange,
      error: couponError,
      applied: appliedCoupon,
      apply: handleApplyCoupon,
      remove: handleRemoveCoupon,
    },
  };
}