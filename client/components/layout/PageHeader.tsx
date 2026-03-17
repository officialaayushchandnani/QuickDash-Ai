import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, User, LogOut, Settings, Package, History, MapPin } from "lucide-react";
import { motion } from "framer-motion";

interface PageHeaderProps {
  onSignInClick: () => void;
  onCartClick: () => void;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ onSignInClick, onCartClick }) => {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={{ type: "spring", stiffness: 250 }}
            className="relative w-10 h-10 rounded-xl 
    bg-gradient-to-br from-brand-green to-brand-orange 
    flex items-center justify-center 
    shadow-lg shadow-brand-green/20
    transition-all duration-300"
          >
            {/* Soft Glow using same brand colors */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-brand-green to-brand-orange opacity-20 blur-md group-hover:opacity-40 transition-all duration-300"></div>

            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="w-6 h-6 text-white drop-shadow-sm relative z-10"
            >
              <path
                d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
                fill="currentColor"
              />
            </svg>
          </motion.div>

          <div className="flex flex-col">
            <h1
              className="text-xl font-bold 
      bg-gradient-to-r from-brand-green to-brand-orange 
      bg-clip-text text-transparent
      group-hover:from-brand-orange 
      group-hover:to-brand-green 
      transition-all duration-500"
            >
              QuickDash AI
            </h1>

            <p
              className="text-xs text-muted-foreground 
      group-hover:text-brand-green 
      transition-colors duration-300"
            >
              Fastest Delivery
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 text-sm text-foreground/80 bg-muted/50 px-3 py-1.5 rounded-full border border-white/5">
            <MapPin className="w-4 h-4 text-brand-orange" />
            <span>Delivering to <span className="font-semibold">Ahmedabad</span></span>
          </div>

          {user ? (
            <div className="flex items-center gap-2">
              {user.role === "customer" && (
                <>
                  <Button variant="ghost" size="sm" asChild className="hidden sm:flex hover:bg-brand-green/10 hover:text-brand-green">
                    <Link to="/orders"><History className="w-4 h-4 mr-2" />My Orders</Link>
                  </Button>
                  <Button variant="outline" size="sm" className="relative border-brand-green/20 hover:border-brand-green hover:bg-brand-green/5" onClick={onCartClick}>
                    <ShoppingCart className="w-4 h-4" />
                    {totalItems > 0 && (
                      <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center rounded-full p-0 text-[10px] bg-brand-orange text-white border-2 border-background animate-in zoom-in">
                        {totalItems}
                      </Badge>
                    )}
                  </Button>
                </>
              )}
              {user.role === "admin" && <Button variant="outline" size="sm" asChild><Link to="/admin"><Settings className="w-4 h-4 mr-2" />Dashboard</Link></Button>}
              {user.role === "delivery_agent" && <Button variant="outline" size="sm" asChild><Link to="/delivery"><Package className="w-4 h-4 mr-2" />Dashboard</Link></Button>}

              <div className="pl-2 border-l ml-1 flex items-center gap-2">
                <div className="hidden sm:flex flex-col items-end text-xs mr-1">
                  <span className="font-medium">{user.name}</span>
                  <span className="text-muted-foreground capitalize">{user.role}</span>
                </div>
                <Button variant="ghost" size="icon" onClick={logout} className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive rounded-full">
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ) : (
            <Button
              onClick={onSignInClick}
              className="bg-brand-green text-white hover:bg-brand-green/90 shadow-lg shadow-brand-green/20 rounded-full px-6 transition-all hover:scale-105"
            >
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};