import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Product } from "@/contexts/CartContext";
import { api } from "@/services/adminService";
import { useProductSearch } from "@/hooks/useProductSearch";
import { PageHeader } from "@/components/layout/PageHeader";
import { HeroSection } from "@/components/layout/HeroSection";
import { ProductSection } from "@/components/layout/ProductSection";
import { PageFooter } from "@/components/layout/PageFooter";
import { LoginForm } from "@/components/auth/LoginForm";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { CategoriesSection } from "@/components/category/CategoriesSection";
import { toast } from "sonner";

const DEFAULT_CATEGORIES = ["All", "Fruits", "Vegetables", "Dairy", "Bakery", "Beverages", "Biscuits", "Pulses", "Spices", "Cooking Oil"];

interface Category {
  _id?: string;
  name: string;
  image: string;
}

export default function IndexPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [categoryObjects, setCategoryObjects] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [fetchedProducts, fetchedCategoryObjects] = await Promise.all([
          api.getProducts(),
          api.getCategories()
        ]);
        setProducts(fetchedProducts);
        setCategoryObjects(fetchedCategoryObjects);

        if (fetchedCategoryObjects.length > 0) {
          const categoryNames = fetchedCategoryObjects.map((cat: any) => cat.name);
          const unique = Array.from(new Set(["All", ...categoryNames]));
          setCategories(unique);
        }
      } catch (err) {
        console.error("Failed to fetch initial data", err);
      }
      setIsLoading(false);
    };
    fetchData();
  }, []);

  const categoryFilteredProducts = useMemo(() =>
    products.filter(p => selectedCategory === "All" || p.category === selectedCategory),
    [products, selectedCategory]
  );

  const filteredProducts = useProductSearch(categoryFilteredProducts, searchQuery);

  const handleProductSuggestionClick = (productId: string) => {
    navigate(`/product/${productId}`);
  };

  const handleCategoryClick = (categoryName: string) => {
    setSelectedCategory(categoryName);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PageHeader onSignInClick={() => setShowLogin(true)} onCartClick={() => setShowCart(true)} />
      <main className="flex-grow">
        <HeroSection
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          products={products}
          onProductClick={handleProductSuggestionClick}
        />
        <CategoriesSection
          categories={categoryObjects}
          onCategoryClick={handleCategoryClick}
        />
        <div id="products-section">
          <ProductSection
            products={filteredProducts}
            categories={categories}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            isLoading={isLoading}
          />
        </div>
      </main>
      <PageFooter />
      {showLogin && <LoginForm onClose={() => setShowLogin(false)} />}
      <CartDrawer isOpen={showCart} onClose={() => setShowCart(false)} />
    </div>
  );
}