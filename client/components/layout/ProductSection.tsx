import React from "react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "./ProductCard";
import { Filter } from "lucide-react";
import { Product } from "@/contexts/CartContext";
import { motion, AnimatePresence } from "framer-motion";

interface ProductSectionProps {
  products: Product[];
  categories: string[];
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  isLoading: boolean;
}

export const ProductSection: React.FC<ProductSectionProps> = ({
  products,
  categories,
  selectedCategory,
  setSelectedCategory,
  isLoading
}) => {
  return (
    <section className="py-12 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Category Header - shown when a specific category is selected */}
        {selectedCategory && selectedCategory !== "All" && (
          <div className="mb-10">
            <div className="flex flex-col items-end w-max">
              <h1 className="text-3xl md:text-4xl font-medium uppercase">
                {selectedCategory === "Vegetables" ? "ORGANIC VEGGIES" :
                  selectedCategory === "FoodGrains" ? "GRAINS & CEREALS" :
                    selectedCategory === "Dairy" ? "DAIRY PRODUCTS" :
                      selectedCategory === "Bakery" ? "BAKERY & BREADS" :
                        selectedCategory === "Fruits" ? "FRESH FRUITS" :
                          selectedCategory === "Beverages" ? "COLD DRINKS" :
                            selectedCategory === "Snacks" ? "INSTANT FOOD" :
                              selectedCategory}
              </h1>
              <div className="w-20 h-0.5 bg-brand-green rounded-full mt-1"></div>
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              {selectedCategory === "All" ? "Trending Products" : ""}
            </h2>
            {selectedCategory === "All" && (
              <p className="text-muted-foreground">Handpicked daily essentials just for you</p>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={`
                  whitespace-nowrap rounded-full transition-all duration-300
                  ${selectedCategory === category
                    ? "bg-brand-green hover:bg-brand-green/90 shadow-md ring-2 ring-brand-green/20"
                    : "hover:border-brand-green/50 hover:bg-brand-green/5"
                  }
                `}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="h-[240px] rounded-lg bg-muted/50 animate-pulse" />
            ))}
          </div>
        ) : products.length > 0 ? (
          <motion.div
            layout
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
          >
            <AnimatePresence mode="popLayout">
              {products.map((product) => (
                <motion.div
                  key={product._id || product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="text-center py-20 bg-muted/20 rounded-2xl border border-dashed">
            <Filter className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-50" />
            <h3 className="text-lg font-medium">No products found</h3>
            <p className="text-muted-foreground">Try selecting a different category</p>
          </div>
        )}
      </div>
    </section>
  );
};