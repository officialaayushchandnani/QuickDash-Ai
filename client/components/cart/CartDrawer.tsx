import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCart, CartItem as CartItemType } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { PRICING_RULES } from '@/config/appConfig'; // FIX: Corrected the import path
import {
  X,
  Plus,
  Minus,
  ShoppingCart,
  CreditCard,
  MapPin,
  Clock,
  Truck,
  User
} from 'lucide-react';

// --- Prop Type Definitions ---
interface CartItemProps {
  item: CartItemType;
}
interface OrderSummaryProps {
  subtotal: number;
}

// ============================================================================
// Child Components (Fully Implemented)
// ============================================================================

/**
 * A component to display a single item in the shopping cart.
 */
const CartItem: React.FC<CartItemProps> = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();
  const { product, quantity } = item;

  return (
    <Card>
      <CardContent className="p-3 flex gap-3">
        <img src={product.image} alt={product.name} className="w-16 h-16 object-cover rounded-md" />
        <div className="flex-1 space-y-1">
          <div className="flex justify-between items-start">
            <h4 className="font-semibold text-sm leading-tight">{product.name}</h4>
            <p className="font-semibold text-sm">₹{product.price * quantity}</p>
          </div>
          <p className="text-xs text-muted-foreground">₹{product.price} each</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Button size="icon" variant="outline" className="w-7 h-7" onClick={() => updateQuantity(product._id || product.id, quantity - 1)} disabled={quantity <= 1}>
                <Minus className="w-3 h-3" />
              </Button>
              <span className="w-8 text-center font-medium text-sm">{quantity}</span>
              <Button size="icon" variant="outline" className="w-7 h-7" onClick={() => updateQuantity(product._id || product.id, quantity + 1)}>
                <Plus className="w-3 h-3" />
              </Button>
            </div>
            <Button size="sm" variant="ghost" onClick={() => removeFromCart(product._id || product.id)} className="text-red-500 hover:text-red-600 p-0 h-auto text-xs">
              Remove
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * A component to display the order summary, including subtotal, fees, and total.
 */
const OrderSummary: React.FC<OrderSummaryProps> = ({ subtotal }) => {
  const deliveryFee = subtotal >= PRICING_RULES.FREE_DELIVERY_THRESHOLD ? 0 : PRICING_RULES.DELIVERY_FEE;
  const tax = Math.round(subtotal * (PRICING_RULES.TAX_RATE_PERCENT / 100));
  const total = subtotal + deliveryFee + tax;

  return (
    <Card>
      <CardHeader className="pb-2"><CardTitle className="text-base">Order Summary</CardTitle></CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div className="flex justify-between"><span>Subtotal</span><span>₹{subtotal.toFixed(0)}</span></div>
        <div className="flex justify-between"><span>Delivery Fee</span><span>{deliveryFee === 0 ? "Free" : `₹${deliveryFee}`}</span></div>
        <div className="flex justify-between"><span>Tax ({PRICING_RULES.TAX_RATE_PERCENT}%)</span><span>₹{tax.toFixed(0)}</span></div>
        <div className="border-t pt-2 mt-2 flex justify-between font-semibold text-lg"><span>Total</span><span>₹{total.toFixed(0)}</span></div>
      </CardContent>
    </Card>
  );
};

/**
 * A component to display the dynamic delivery information based on the logged-in user.
 */
const DeliveryInfo = () => {
  const { user } = useAuth();
  return (
    <Card>
      <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Truck className="w-4 h-4" />Delivery Information</CardTitle></CardHeader>
      <CardContent className="space-y-3 text-sm">
        {user ? (
          <>
            <div className="flex items-start gap-2"><User className="w-4 h-4 mt-0.5 text-muted-foreground" /><div className="flex-1"><p className="font-medium">{user.name}</p></div></div>
            <div className="flex items-start gap-2"><MapPin className="w-4 h-4 mt-0.5 text-muted-foreground" /><p>{user.address || 'No address on file. Please add one.'}</p></div>
          </>
        ) : (<p className="text-muted-foreground">Please sign in to see your delivery address.</p>)}
        <div className="flex items-center gap-2 pt-2 border-t mt-2"><Clock className="w-4 h-4 text-muted-foreground" /><p>Expected delivery: 15-25 mins</p></div>
        <p className="text-xs text-muted-foreground">Free delivery on orders over ₹{PRICING_RULES.FREE_DELIVERY_THRESHOLD}</p>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Main CartDrawer Component
// ============================================================================
export const CartDrawer: React.FC<{ isOpen: boolean; onClose: () => void; }> = ({ isOpen, onClose }) => {
  const { items, totalPrice, totalItems } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!user) {
      toast.error("Please sign in to proceed with checkout");
      return;
    }
    onClose();
    navigate("/payment");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose}>
      <div className="w-full max-w-md bg-background h-full flex flex-col ml-auto" onClick={(e) => e.stopPropagation()}>
        <header className="sticky top-0 bg-background border-b p-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />Shopping Cart
            {totalItems > 0 && <Badge>{totalItems}</Badge>}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="w-5 h-5" /></Button>
        </header>

        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Your cart is empty</h3>
              <Button onClick={onClose}>Continue Shopping</Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-3">{items.map((item) => <CartItem key={item.product.id} item={item} />)}</div>
              <DeliveryInfo />
              <OrderSummary subtotal={totalPrice} />
            </div>
          )}
        </div>

        {items.length > 0 && (
          <footer className="sticky bottom-0 bg-background border-t p-4 space-y-3">
            <Button className="w-full h-12 text-base" onClick={handleCheckout}>
              <CreditCard className="w-4 h-4 mr-2" />Proceed to Checkout
            </Button>
            <Button variant="outline" className="w-full" onClick={onClose}>
              Continue Shopping
            </Button>
          </footer>
        )}
      </div>
    </div>
  );
};