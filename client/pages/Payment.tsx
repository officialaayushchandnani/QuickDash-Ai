import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCheckout } from "@/hooks/useCheckout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Dialog } from "@/components/ui/dialog";
import { AddAddressForm } from "@/components/checkout/AddAddressForm";
import { CartItem } from "@/contexts/CartContext";
import { ArrowLeft, Shield, Loader2, CheckCircle, Clock } from "lucide-react";


// FIX: Define the props for the OrderSummaryCard to remove the TypeScript error.
interface OrderSummaryCardProps {
  costs: {
    subtotal: number;
    deliveryFee: number;
    tax: number;
    discount: number;
    total: number;
  };
  cart: CartItem[];
  isProcessing: boolean;
  onPlaceOrder: () => void;
}

// FIX: Apply the props type to the component using React.FC
const OrderSummaryCard: React.FC<OrderSummaryCardProps> = ({ costs, cart, isProcessing, onPlaceOrder }) => (
  <Card className="sticky top-24">
    <CardHeader><CardTitle>Order Summary</CardTitle></CardHeader>
    <CardContent className="space-y-4">
      <div className="space-y-2">
        {cart.map(item => (
          <div key={item.product.id} className="flex justify-between items-center text-sm">
            <div>
              <p className="font-medium">{item.product.name}</p>
              <p className="text-xs text-muted-foreground">Qty: {item.quantity} × ₹{item.product.price}</p>
            </div>
            <p className="font-medium">₹{item.product.price * item.quantity}</p>
          </div>
        ))}
      </div>
      <Separator />
      <div className="space-y-1 text-sm">
        <div className="flex justify-between"><span>Subtotal</span><span>₹{costs.subtotal}</span></div>
        <div className="flex justify-between"><span>Delivery Fee</span><span>{costs.deliveryFee === 0 ? "FREE" : `₹${costs.deliveryFee}`}</span></div>
        <div className="flex justify-between"><span>Tax (5%)</span><span>₹{costs.tax}</span></div>
        {costs.discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-₹{costs.discount}</span></div>}
      </div>
      <Separator />
      <div className="flex justify-between font-bold text-lg"><span>Total</span><span>₹{costs.total}</span></div>
      <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg mt-2">
        <Clock className="w-4 h-4 text-green-600" />
        <span className="text-sm font-medium text-green-700">Expected delivery in 15-30 minutes</span>
      </div>
      <Button className="w-full h-12 text-base mt-4" onClick={onPlaceOrder} disabled={isProcessing || cart.length === 0}>
        {isProcessing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Processing...</> : `Place Order ₹${costs.total}`}
      </Button>
      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2"><Shield className="w-3 h-3" /><span>Your payment information is secure and encrypted</span></div>
    </CardContent>
  </Card>
);

// Main Page Component
export default function PaymentPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const checkout = useCheckout();
  const [deliveryInstructions, setDeliveryInstructions] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    };
    if (checkout.cart.length === 0 && !checkout.orderPlaced) {
      navigate("/");
      return;
    };
  }, [user, checkout.cart.length, checkout.orderPlaced, navigate]);

  if (checkout.orderPlaced) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Order Placed Successfully!</h2>
            <p className="text-muted-foreground">Redirecting to your orders...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 h-16 flex items-center">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
          <h1 className="text-xl font-semibold ml-4">Checkout</h1>
        </div>
      </header>
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Delivery Address</h2>
              <RadioGroup value={checkout.selectedAddressId || ''} onValueChange={checkout.setSelectedAddressId}>
                {checkout.addresses.map(address => (
                  <div key={address.id} className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-muted/50 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-muted/50">
                    <RadioGroupItem value={address.id} id={`addr-${address.id}`} className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor={`addr-${address.id}`} className="font-medium cursor-pointer">{address.name}</Label>
                      <p className="text-sm text-muted-foreground">{address.address}</p>
                    </div>
                  </div>
                ))}
              </RadioGroup>
              <Button variant="outline" className="w-full" onClick={checkout.addressModal.open}>
                Add New Address
              </Button>
            </div>
            <div className="space-y-2">
              <Label className="text-base font-medium">Delivery Instructions (Optional)</Label>
              <Textarea placeholder="e.g., Leave at door, Ring doorbell, etc." value={deliveryInstructions} onChange={(e) => setDeliveryInstructions(e.target.value)} />
            </div>
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Payment Method</h2>
              <RadioGroup
                value={checkout.paymentMethod}
                onValueChange={checkout.setPaymentMethod}
                className="space-y-3"
              >
                <div className="flex items-center space-x-3 p-4 border rounded-lg has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-muted/50"><RadioGroupItem value="razorpay" id="razorpay" /><Label htmlFor="razorpay" className="font-medium flex-1 cursor-pointer">Pay Online (Razorpay)</Label></div>
                <div className="flex items-center space-x-3 p-4 border rounded-lg has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-muted/50"><RadioGroupItem value="cod" id="cod" /><Label htmlFor="cod" className="font-medium flex-1 cursor-pointer">Cash on Delivery</Label></div>
              </RadioGroup>
            </div>
            <div className="space-y-2">
              <Label className="text-base font-medium">Apply Coupon</Label>
              {checkout.coupon.applied ? (
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <p className="font-medium text-green-800">'{checkout.coupon.applied.code}' applied!</p>
                  <Button variant="ghost" size="sm" onClick={checkout.coupon.remove} className="text-green-700">Remove</Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input placeholder="Enter coupon code" value={checkout.coupon.code} onChange={e => checkout.coupon.setCode(e.target.value)} />
                    <Button variant="outline" onClick={checkout.coupon.apply} disabled={!checkout.coupon.code}>Apply</Button>
                  </div>
                  <p className="text-xs text-muted-foreground">💡 Try these codes: <strong>EXTRA5</strong> (5% off), <strong>WELCOME10</strong> (10% off), <strong>SAVE15</strong> (15% off on ₹500+)</p>
                  {checkout.coupon.error && <p className="text-sm text-red-600 mt-1">{checkout.coupon.error}</p>}
                </div>
              )}
            </div>
          </div>
          {/* Right Column */}
          <div className="space-y-6">
            <OrderSummaryCard costs={checkout.costs} cart={checkout.cart} isProcessing={checkout.isProcessing} onPlaceOrder={checkout.handlePlaceOrder} />
          </div>
        </div>
      </main>
      <Dialog open={checkout.addressModal.isOpen} onOpenChange={checkout.addressModal.close}>
        <AddAddressForm onSave={checkout.addressModal.save} onCancel={checkout.addressModal.close} />
      </Dialog>
    </div>
  );
}