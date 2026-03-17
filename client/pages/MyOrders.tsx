import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { orderApi } from "@/services/orderService";
import { Order } from "@/types";
import { getStatusConfig } from "@/lib/orderUtils";
import { ArrowLeft, Package, Search, RotateCcw, MessageSquare, MapPin, Phone, Star, Download } from "lucide-react";

// ============================================================================
// Child Component: OrderCard (Fully Implemented)
// ============================================================================
const OrderCard = ({ order }: { order: Order }) => {
  const statusConfig = getStatusConfig(order.status);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date";
    return date.toLocaleString("en-IN", {
      day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
    });
  };

  return (
    <Card className="overflow-hidden shadow-sm">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <CardTitle className="text-lg">Order #{order.orderNumber}</CardTitle>
            <p className="text-sm text-muted-foreground">{formatDate(order.date || order.createdAt)}</p>
          </div>
          <Badge className={`${statusConfig.color} gap-1.5 self-start sm:self-center`}>
            {statusConfig.icon}
            {statusConfig.text}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Items List */}
        <div className="space-y-3">
          {order.items.map(item => (
            <div key={item.id} className="flex items-center gap-4">
              <img src={item.image} alt={item.name} className="w-12 h-12 rounded-md object-cover border" />
              <div className="flex-1">
                <p className="font-medium text-sm">{item.name}</p>
                <p className="text-xs text-muted-foreground">Qty: {item.quantity} × ₹{item.price}</p>
              </div>
              <p className="font-semibold text-sm">₹{item.price * item.quantity}</p>
            </div>
          ))}
        </div>
        <Separator />
        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground mb-1">Delivery Address</p>
            <p className="font-medium flex items-start gap-2"><MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />{order.deliveryAddress}</p>
          </div>
          <div>
            <p className="text-muted-foreground mb-1">Payment Method</p>
            <p className="font-medium">{order.paymentMethod}</p>
          </div>
        </div>
        {/* Delivery Agent Info */}
        {order.deliveryAgent && (
          <div className="p-3 bg-muted/50 rounded-lg flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm mb-1">Delivery Agent</p>
              <div className="flex items-center gap-2">
                <div className="font-semibold">{order.deliveryAgent.name}</div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />{order.deliveryAgent.rating}
                </div>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => window.location.href = `tel:${order.deliveryAgent?.phone}`}>
              <Phone className="w-3 h-3 mr-2" />Call
            </Button>
          </div>
        )}
        <Separator />
        {/* Total and Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-lg font-bold">Total: ₹{order.total}</p>
            {order.estimatedDelivery && <p className="text-xs text-muted-foreground">Expected by {formatDate(order.estimatedDelivery)}</p>}
          </div>
          <div className="flex gap-2 self-end sm:self-center">
            {order.status === "delivered" && <Button variant="outline" size="sm"><RotateCcw className="w-4 h-4 mr-2" />Reorder</Button>}
            {order.status === "delivered" && <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-2" />Invoice</Button>}
            {order.status !== "delivered" && order.status !== "cancelled" && <Button variant="outline" size="sm"><Package className="w-4 h-4 mr-2" />Track</Button>}
            <Button variant="outline" size="sm"><MessageSquare className="w-4 h-4 mr-2" />Help</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

import { useSocket } from "@/contexts/SocketContext";
import { toast } from "sonner";

// ... (OrderCard component remains same)

// ============================================================================
// Main Page Component: MyOrders
// ============================================================================
export default function MyOrdersPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { socket } = useSocket();

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }

    const fetchOrders = async () => {
      setIsLoading(true);
      const userOrders = await orderApi.getOrdersForUser(user.id);
      setOrders(userOrders);
      setIsLoading(false);
    };

    fetchOrders();
  }, [user, navigate]);

  useEffect(() => {
    if (!socket || !user) return;

    // Listen for status updates on my orders
    socket.on('order-updated', (updatedOrder: Order) => {
      // Check if this order belongs to me (optimization: server should ideally room-base this)
      // Since we broadcast, we must check userId match if present in order object (it usually is)
      // updatedOrder might validly not have userId populated, so we assume if we have it in our list, update it.
      setOrders(prev => {
        const exists = prev.find(o => o._id === updatedOrder._id || o.id === updatedOrder.id);
        if (exists) {
          toast.success(`Order #${updatedOrder.orderNumber} status updated: ${updatedOrder.status}`);
          return prev.map(o => (o._id === updatedOrder._id || o.id === updatedOrder.id) ? updatedOrder : o);
        }
        return prev;
      });
    });

    // Listen for new orders (e.g. placed from another tab)
    socket.on('new-order', (newOrder: Order) => {
      // Check if this order belongs to current user
      // We might need to handle the case where userId is populated vs string
      const newOrderUserId = typeof newOrder.userId === 'object' ? (newOrder.userId as any)._id : newOrder.userId;

      if (newOrderUserId === user.id) {
        setOrders(prev => [newOrder, ...prev]);
        toast.success(`Order #${newOrder.orderNumber} placed successfully!`);
      }
    });

    return () => {
      socket.off('order-updated');
      socket.off('new-order');
    };
  }, [socket, user]);

  const filteredOrders = useMemo(() => {
    const activeStatuses = ["pending", "confirmed", "preparing", "out_for_delivery"];
    if (!Array.isArray(orders)) return [];

    return orders
      .filter(order => {
        if (activeTab === "all") return true;
        if (activeTab === "active") return activeStatuses.includes(order.status);
        return order.status === activeTab;
      })
      .filter(order =>
        order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.items.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
      );
  }, [orders, activeTab, searchQuery]);

  const orderCounts = useMemo(() => {
    if (!Array.isArray(orders)) return { all: 0, active: 0, delivered: 0, cancelled: 0 };
    return {
      all: orders.length,
      active: orders.filter(o => ["pending", "confirmed", "preparing", "out_for_delivery"].includes(o.status)).length,
      delivered: orders.filter(o => o.status === "delivered").length,
      cancelled: orders.filter(o => o.status === "cancelled").length,
    }
  }, [orders]);

  if (!user) return null; // Render nothing while redirecting

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 h-16 flex items-center">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="mr-4">
            <ArrowLeft className="w-4 h-4 mr-2" />Back to Home
          </Button>
          <h1 className="text-xl font-semibold">My Orders</h1>
        </div>
      </header>
      <main className="container mx-auto px-4 py-6">
        <div className="relative max-w-md mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input placeholder="Search orders by number or items..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All ({orderCounts.all})</TabsTrigger>
            <TabsTrigger value="active">Active ({orderCounts.active})</TabsTrigger>
            <TabsTrigger value="delivered">Delivered ({orderCounts.delivered})</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled ({orderCounts.cancelled})</TabsTrigger>
          </TabsList>
          <TabsContent value={activeTab} className="mt-6">
            {isLoading ? <p className="text-center text-muted-foreground py-12">Loading your orders...</p> :
              filteredOrders.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold">No Orders Found</h3>
                  <p className="text-sm text-muted-foreground">You haven't placed any orders in this category yet.</p>
                  <Button asChild className="mt-4"><Link to="/">Start Shopping</Link></Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredOrders.map(order => <OrderCard key={order._id || order.id} order={order} />)}
                </div>
              )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}