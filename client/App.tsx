import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { SocketProvider } from "./contexts/SocketContext";
import Index from "./pages/Index";
import AdminDashboard from "./pages/AdminDashboard";
import DeliveryDashboard from "./pages/DeliveryDashboard";
import ProductDetail from "./pages/ProductDetail";
import CustomerDetail from "./pages/CustomerDetail";
import Payment from "./pages/Payment";
import MyOrders from "./pages/MyOrders";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <SocketProvider>
        <CartProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/delivery" element={<DeliveryDashboard />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/customer/:id" element={<CustomerDetail />} />
                <Route path="/admin/customer/:id" element={<CustomerDetail />} />
                <Route path="/payment" element={<Payment />} />
                <Route path="/orders" element={<MyOrders />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </CartProvider>
      </SocketProvider>
    </AuthProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
