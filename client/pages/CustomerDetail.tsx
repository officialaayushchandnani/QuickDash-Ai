import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/services/adminService"; // Import our API service
import {
  ArrowLeft, Mail, Phone, Calendar, MapPin, ShoppingCart,
  DollarSign, Package, Star, User, Edit, Ban
} from "lucide-react";

// ============================================================================
// Sub-components for the Customer Detail Page
// In a larger project, these would be in their own files (e.g., components/customer/CustomerProfile.tsx)
// ============================================================================

const CustomerProfile = ({ customer }) => (
  <Card>
    <CardHeader>
      <div className="flex items-center justify-between">
        <CardTitle className="flex items-center gap-2"><User className="w-5 h-5" /> Profile</CardTitle>
        <Badge variant={customer.status === "VIP" ? "default" : "secondary"}>{customer.status}</Badge>
      </div>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="text-center pb-4 border-b">
        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-3">
          {customer.name.split(" ").map(n => n[0]).join("")}
        </div>
        <h2 className="text-xl font-semibold">{customer.name}</h2>
        <p className="text-muted-foreground text-sm">Customer ID: {customer.id}</p>
      </div>
      <div className="space-y-3 text-sm">
        <div className="flex items-start gap-3"><Mail className="w-4 h-4 mt-1 text-muted-foreground" /><span>{customer.email}</span></div>
        <div className="flex items-start gap-3"><Phone className="w-4 h-4 mt-1 text-muted-foreground" /><span>{customer.phone}</span></div>
        <div className="flex items-start gap-3"><MapPin className="w-4 h-4 mt-1 text-muted-foreground" /><span>{customer.address}</span></div>
        <div className="flex items-start gap-3"><Calendar className="w-4 h-4 mt-1 text-muted-foreground" /><span>Joined {new Date(customer.joinDate).toLocaleDateString()}</span></div>
      </div>
      <div className="flex gap-2 pt-4"><Button variant="outline" size="sm" className="flex-1"><Edit className="w-4 h-4 mr-2" />Edit</Button><Button variant="destructive" size="sm" className="flex-1"><Ban className="w-4 h-4 mr-2" />Block</Button></div>
    </CardContent>
  </Card>
);

const CustomerStats = ({ customer }) => (
  <Card>
    <CardHeader><CardTitle>Statistics</CardTitle></CardHeader>
    <CardContent className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-3 bg-muted/50 rounded-lg">
          <p className="text-2xl font-bold">{customer.orders}</p>
          <p className="text-xs text-muted-foreground">Total Orders</p>
        </div>
        <div className="text-center p-3 bg-muted/50 rounded-lg">
          <p className="text-2xl font-bold">₹{customer.totalSpent}</p>
          <p className="text-xs text-muted-foreground">Total Spent</p>
        </div>
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between"><span>Favorite Category:</span><Badge variant="outline">{customer.favoriteCategory}</Badge></div>
        <div className="flex justify-between"><span>Last Order:</span><span className="text-muted-foreground">{new Date(customer.lastOrder).toLocaleDateString()}</span></div>
        <div className="flex justify-between"><span>Average Order:</span><span className="font-medium">₹{(customer.totalSpent / customer.orders).toFixed(2)}</span></div>
      </div>
    </CardContent>
  </Card>
);

const OrderHistory = ({ orders }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2"><Package className="w-5 h-5" /> Recent Orders</CardTitle>
      <CardDescription>Latest {orders.length} orders from this customer</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {orders.map(order => (
          <div key={order.id} className="border rounded-lg p-3">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-semibold">{order.id}</h4>
                <p className="text-sm text-muted-foreground">{new Date(order.date).toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">₹{order.amount}</p>
                <Badge>{order.status}</Badge>
              </div>
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

// ============================================================================
// Main CustomerDetail Page Component
// ============================================================================

export default function CustomerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [customer, setCustomer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch the specific customer's data when the component mounts or the ID changes.
    const fetchCustomer = async () => {
      if (!id) return;
      setIsLoading(true);
      const customerData = await api.getCustomerById(id);
      setCustomer(customerData);
      setIsLoading(false);
    };
    fetchCustomer();
  }, [id]);

  // Security check for admin role
  if (!user || user.role !== "admin") {
    return <div>Access Denied.</div>; // Simplified for brevity
  }

  if (isLoading) {
    return <div className="p-8">Loading customer details...</div>;
  }

  if (!customer) {
    return <div className="p-8">Customer not found.</div>; // Simplified for brevity
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 h-16 flex items-center">
          <Button variant="ghost" onClick={() => navigate("/admin")} className="mr-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Admin
          </Button>
          <h1 className="text-lg font-semibold">Customer Details</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <CustomerProfile customer={customer} />
            <CustomerStats customer={customer} />
          </div>
          <div className="lg:col-span-2">
            <OrderHistory orders={customer.recentOrders} />
          </div>
        </div>
      </main>
    </div>
  );
}