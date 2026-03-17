import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search, Clock, Truck, Shield } from "lucide-react";
import { SearchSuggestions } from "@/components/ui/search-suggestions";
import { motion } from "framer-motion";

export const HeroSection = ({ searchQuery, setSearchQuery, products, onProductClick }) => {
  const [isFocused, setIsFocused] = useState(false);
  const showSuggestions = isFocused && searchQuery.length > 0;
  
  // When a text suggestion is clicked, we just update the search bar's text.
  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <section className="bg-gradient-to-br from-brand-green/10 via-background to-brand-orange/10 py-12 md:py-20 overflow-hidden">
      <div className="container mx-auto px-4 text-center">
        <motion.div 
          initial="hidden" 
          animate="show" 
          variants={container}
        >
          <motion.h2 
            variants={item}
            className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-brand-green to-brand-orange bg-clip-text text-transparent"
          >
            10-30 Minute Delivery
          </motion.h2>
          <motion.p 
            variants={item}
            className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto"
          >
            AI-powered hyperlocal delivery of fresh groceries and essentials. Smart routing, and real-time tracking.
          </motion.p>
          
          <motion.div variants={item} className="max-w-2xl mx-auto mb-8 relative z-20">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5 z-10" />
              <Input
                placeholder="Search for milk, bread, or anything..."
                className="h-14 pl-12 pr-4 text-lg rounded-full shadow-lg border-brand-green/20 focus-visible:ring-brand-green"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setTimeout(() => setIsFocused(false), 200)}
              />
              <SearchSuggestions 
                query={searchQuery}
                products={products}
                isVisible={showSuggestions}
                onProductClick={onProductClick}
                onSuggestionClick={handleSuggestionClick}
              />
            </div>
          </motion.div>

          {/* The features section  */}
          <motion.div 
            variants={container}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
          >
              <motion.div variants={item} className="flex items-center gap-3 justify-center p-4 rounded-xl hover:bg-white/5 transition-colors">
                <div className="w-12 h-12 bg-brand-green/10 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-brand-green" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold">Lightning Fast</h3>
                  <p className="text-sm text-muted-foreground">
                    10-30 min delivery
                  </p>
                </div>
              </motion.div>
              <motion.div variants={item} className="flex items-center gap-3 justify-center p-4 rounded-xl hover:bg-white/5 transition-colors">
                <div className="w-12 h-12 bg-brand-orange/10 rounded-full flex items-center justify-center">
                  <Truck className="w-6 h-6 text-brand-orange" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold">Smart Routing</h3>
                  <p className="text-sm text-muted-foreground">
                    AI-optimized delivery
                  </p>
                </div>
              </motion.div>
              <motion.div variants={item} className="flex items-center gap-3 justify-center p-4 rounded-xl hover:bg-white/5 transition-colors">
                <div className="w-12 h-12 bg-brand-blue/10 rounded-full flex items-center justify-center">
                  <Shield className="w-6 h-6 text-brand-blue" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold">Quality Assured</h3>
                  <p className="text-sm text-muted-foreground">
                    Fresh & verified
                  </p>
                </div>
              </motion.div>
            </motion.div>
        </motion.div>
      </div>
    </section>
  );
};