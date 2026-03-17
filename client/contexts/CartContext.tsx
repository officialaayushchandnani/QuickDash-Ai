import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useMemo,
} from "react";
import { Product as ProductType } from "@/types"; // Import from your central types file

// ============================================================================
// Type Definitions
// ============================================================================
export interface Product extends ProductType {
  _id?: string; // Add _id from MongoDB
}

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalPrice: number;
  totalItems: number;
}

// ============================================================================
// Context and Custom Hook
// ============================================================================

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

// ============================================================================
// Cart Provider Component
// ============================================================================

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const savedCart = localStorage.getItem("cart");
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.error("Failed to parse cart from localStorage", error);
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items));
  }, [items]);

  // FIX: This is the corrected addToCart logic.
  const addToCart = (product: Product, quantity: number = 1) => {
    setItems((currentItems) => {
      const itemProductId = product._id || product.id;
      const existingItem = currentItems.find(
        (item) => (item.product._id || item.product.id) === itemProductId
      );

      // If the item already exists, update its quantity
      if (existingItem) {
        return currentItems.map((item) =>
          (item.product._id || item.product.id) === itemProductId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      
      // If it's a new item, add it to the end of the array
      return [...currentItems, { product, quantity }];
    });
  };

  const removeFromCart = (productId: string) => {
    setItems((currentItems) =>
      currentItems.filter((item) => (item.product._id || item.product.id) !== productId)
    );
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setItems((currentItems) =>
      currentItems.map((item) =>
        (item.product._id || item.product.id) === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalPrice = useMemo(() => {
    return items.reduce(
      (total, item) => total + item.product.price * item.quantity, 0
    );
  }, [items]);

  const totalItems = useMemo(() => {
    return items.reduce((total, item) => total + item.quantity, 0);
  }, [items]);

  const value = {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalPrice,
    totalItems,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};