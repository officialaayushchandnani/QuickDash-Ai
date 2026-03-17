import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart, Product } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Star, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

export const ProductCard = ({ product }: { product: Product }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      toast.error("Please sign in to add items to your cart.");
      return;
    }
    addToCart(product);
    toast.success(`${product.name} added to cart!`);
  };

  const productId = product._id || product.id;

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="h-full"
    >
      <Card
        className="group h-full flex flex-col overflow-hidden cursor-pointer border hover:border-brand-green/30 hover:shadow-md transition-all duration-300 bg-white"
        onClick={() => navigate(`/product/${productId}`)}
      >
        <CardHeader className="p-0 relative overflow-hidden">
          <div className="relative aspect-square overflow-hidden bg-muted/30">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-contain p-2 transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        </CardHeader>
        <CardContent className="p-2 flex flex-col flex-grow">
          <div className="mb-1.5">
            <Badge variant="outline" className="text-[8px] h-3.5 px-1 mb-1 border-muted-foreground/20 text-muted-foreground">
              {product.category}
            </Badge>
            <h3 className="font-medium text-xs leading-tight line-clamp-2 mb-0.5 min-h-[2rem]">
              {product.name}
            </h3>
          </div>

          <div className="mt-auto">
            <div className="flex items-center gap-0.5 mb-1.5">
              <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
              <span className="text-[10px] font-medium">{product.rating}</span>
              <span className="text-[9px] text-muted-foreground">({product.reviews})</span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-muted-foreground line-through">₹{Math.round(product.price * 1.2)}</p>
                <p className="text-base font-bold text-foreground">₹{product.price}</p>
              </div>

              {(!user || user.role === "customer") && (
                <Button
                  size="sm"
                  onClick={handleAddToCart}
                  disabled={!user}
                  className={`
                    h-7 px-2 rounded-md text-[10px] font-medium transition-all
                    ${user
                      ? 'bg-brand-green hover:bg-brand-green/90 text-white'
                      : 'bg-muted text-muted-foreground'
                    }
                  `}
                >
                  <Plus className="w-3 h-3 mr-0.5" />
                  Add
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};