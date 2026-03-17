import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart, Product } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/services/adminService";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { ArrowLeft, Star, Clock, Package, Shield, Plus, Minus, Heart, Share2 } from "lucide-react";

// ============================================================================
// Prop Type Definitions for Child Components
// ============================================================================
interface AddToCartWidgetProps {
  product: Product;
  quantity: number;
  onQuantityChange: (delta: number) => void;
  onAddToCart: () => void;
}

interface MobileStickyFooterProps {
    product: Product;
    onAddToCart: () => void;
}

// ============================================================================
// Child Components for the New Design (Fully Implemented)
// ============================================================================

const AddToCartWidget: React.FC<AddToCartWidgetProps> = ({ product, quantity, onQuantityChange, onAddToCart }) => {
  const { user } = useAuth();
  return (
    <Card className="p-5 rounded-2xl shadow-xl border bg-background/60 backdrop-blur-xl sticky top-24 hidden lg:block">
      <CardContent className="space-y-5 p-0">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Quantity</span>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onQuantityChange(-1)} disabled={quantity <= 1}><Minus className="w-4 h-4" /></Button>
            <span className="w-12 text-center font-semibold text-lg">{quantity}</span>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onQuantityChange(1)} disabled={quantity >= product.stock}><Plus className="w-4 h-4" /></Button>
          </div>
        </div>
        <Button className="w-full h-12 text-lg rounded-xl" onClick={onAddToCart} disabled={!user}>
          {user ? `Add to Cart • ₹${product.price * quantity}` : "Sign in to Add"}
        </Button>
      </CardContent>
    </Card>
  );
};

const MobileStickyFooter: React.FC<MobileStickyFooterProps> = ({ product, onAddToCart }) => {
    const { user } = useAuth();
    return (
        <div className="fixed bottom-0 left-0 right-0 lg:hidden bg-background/80 backdrop-blur-xl border-t shadow-md p-3 flex items-center justify-between gap-4">
            <div>
                <p className="text-lg font-bold">₹{product.price}</p>
                <span className="text-xs text-muted-foreground">Incl. of all taxes</span>
            </div>
            <Button className="rounded-xl h-12 px-6 text-base flex-1" onClick={onAddToCart} disabled={!user}>
                {user ? "Add to Cart" : "Sign in to Order"}
            </Button>
        </div>
    );
};


// ============================================================================
// Main ProductDetailPage Component
// ============================================================================
export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) { setIsLoading(false); return; }
      setIsLoading(true);
      const fetchedProduct = await api.getProductById(id);
      setProduct(fetchedProduct);
      setIsLoading(false);
    };
    fetchProduct();
  }, [id]);

  const handleQuantityChange = (delta: number) => {
    if (!product) return;
    setQuantity(prev => Math.max(1, Math.min(product.stock, prev + delta)));
  };

  const handleAddToCart = () => {
    if (!product) return;
    if (!user) {
      toast.error("Please sign in to add items to your cart.");
      return;
    }
    addToCart(product, quantity);
    toast.success(`Added ${quantity} x ${product.name} to cart!`);
  };

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading product...</div>;
  }

  if (!product) {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <CardTitle>Product Not Found</CardTitle>
                    <CardDescription>The product you're looking for doesn't exist.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={() => navigate("/")}><ArrowLeft className="w-4 h-4 mr-2" />Back to Homepage</Button>
                </CardContent>
            </Card>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/50 pb-24 lg:pb-0">
      <header className="sticky top-0 z-40 w-full border-b bg-background/70 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-16 flex items-center">
          <Button variant="ghost" onClick={() => navigate(-1)} className="rounded-full"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
          <h1 className="text-lg font-semibold ml-4">{product.name}</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left: Product Gallery (with your animations) */}
          <motion.div className="space-y-5 flex flex-col items-center" initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <div className="w-full max-w-md aspect-square rounded-2xl overflow-hidden border shadow-2xl bg-background/50 backdrop-blur-xl">
              <img src={product.image} alt={product.name} className="w-full h-full object-cover hover:scale-110 transition-transform duration-300" />
            </div>
            <div className="flex gap-2 w-full max-w-md">
              <Button variant="outline" size="sm" className="flex-1 rounded-full"><Heart className="w-4 h-4 mr-2" />Wishlist</Button>
              <Button variant="outline" size="sm" className="flex-1 rounded-full"><Share2 className="w-4 h-4 mr-2" />Share</Button>
            </div>
          </motion.div>

          {/* Right: Details (with your animations) */}
          <motion.div className="space-y-6" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
            <Badge variant="secondary" className="text-sm px-3 py-1 rounded-full">{product.category}</Badge>
            <h1 className="text-4xl font-extrabold leading-tight">{product.name}</h1>
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{product.rating}</span>
              <span className="text-muted-foreground">({product.reviews} reviews)</span>
            </div>
            <p className="text-muted-foreground leading-relaxed text-lg">{product.description}</p>
            <Card className="shadow-md border rounded-2xl bg-background/60 backdrop-blur-xl">
              <CardContent className="p-5 grid grid-cols-3 gap-4 text-center">
                <div className="flex flex-col items-center gap-1"><Clock className="w-6 h-6 text-green-500" /><p className="font-medium text-sm">{product.deliveryTime}</p></div>
                <div className="flex flex-col items-center gap-1"><Package className="w-6 h-6 text-orange-500" /><p className="font-medium text-sm">{product.stock} in stock</p></div>
                <div className="flex flex-col items-center gap-1"><Shield className="w-6 h-6 text-blue-500" /><p className="font-medium text-sm">Quality Assured</p></div>
              </CardContent>
            </Card>
            <AddToCartWidget product={product} quantity={quantity} onQuantityChange={handleQuantityChange} onAddToCart={handleAddToCart} />
          </motion.div>
        </div>
      </main>

      <MobileStickyFooter product={product} onAddToCart={handleAddToCart} />
    </div>
  );
}