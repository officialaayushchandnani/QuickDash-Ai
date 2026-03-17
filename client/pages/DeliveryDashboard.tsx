import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useSocket } from "@/contexts/SocketContext";
import { toast } from "sonner";
import { deliveryApi, Delivery, RecentCompletion, DeliveryCustomer } from "@/services/deliveryService";
import {
  MapPin, Clock, Package, Navigation, DollarSign, Phone,
  User, Mail, Home, Check, X, ThumbsUp, PackageCheck, CheckCircle, Loader2
} from "lucide-react";


// --- Prop Type Definitions ---
interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ElementType;
}
interface DeliveryCardProps {
  delivery: Delivery;
  onStatusChange: (orderId: string, newStatus: Delivery['status']) => void;
  onNavigate: (customer: DeliveryCustomer) => void;
  onCall: (phoneNumber: string) => void;
  onViewDetails: (delivery: Delivery) => void;
}
interface CustomerDetailsDialogProps {
  delivery: Delivery | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}
interface RecentCompletionsCardProps {
  completions: RecentCompletion[];
}

const statusStyles: Record<Delivery['status'], BadgeProps['variant']> = {
  Assigned: "secondary",
  Accepted: "outline",
  "Picked Up": "default",
  Delivered: "default",
  Rejected: "destructive",
};

// ============================================================================
// Child Components (Fully Implemented)
// ============================================================================

const StatCard: React.FC<StatCardProps> = ({ title, value, description, icon: Icon }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

const DeliveryCard: React.FC<DeliveryCardProps> = ({ delivery, onStatusChange, onNavigate, onCall, onViewDetails }) => {
  return (
    <div className="border rounded-lg p-4 space-y-3 bg-card shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-bold text-primary">{delivery.id}</h4>
          <p className="text-sm text-muted-foreground font-medium">Customer: {delivery.customer.name}</p>
        </div>
        <Badge variant={statusStyles[delivery.status]} className="px-2 py-1">{delivery.status}</Badge>
      </div>
      <div className="text-sm space-y-2">
        <div className="flex items-start gap-2"><MapPin className="w-4 h-4 mt-0.5 text-red-500 flex-shrink-0" /><span>{delivery.customer.address}</span></div>
        <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-blue-500" /><span>ETA: {delivery.estimatedTime}</span></div>
        <div className="flex items-center gap-2"><Package className="w-4 h-4 text-orange-500" /><span>{delivery.items.join(", ")}</span></div>
        <div className="flex items-center gap-2"><DollarSign className="w-4 h-4 text-green-600" /><span>Expected: ₹{delivery.expectedEarnings}</span></div>
      </div>

      <div className="flex flex-wrap gap-2 pt-3 border-t">
        {delivery.status === "Assigned" && <>
          <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => onStatusChange(delivery._id, "Accepted")}><Check className="w-4 h-4 mr-2" />Accept</Button>
          <Button size="sm" variant="destructive" className="flex-1" onClick={() => onStatusChange(delivery._id, "Rejected")}><X className="w-4 h-4 mr-2" />Reject</Button>
        </>}
        {delivery.status === "Accepted" && <>
          <Button size="sm" className="flex-1" onClick={() => onStatusChange(delivery._id, "Picked Up")}><PackageCheck className="w-4 h-4 mr-2" />Mark Picked Up</Button>
          <Button size="sm" variant="outline" onClick={() => onNavigate(delivery.customer)}><Navigation className="w-4 h-4 mr-2 text-blue-500" />Navigate</Button>
        </>}
        {delivery.status === "Picked Up" && <>
          <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={() => onStatusChange(delivery._id, "Delivered")}><ThumbsUp className="w-4 h-4 mr-2" />Mark Delivered</Button>
          <Button size="sm" variant="outline" onClick={() => onNavigate(delivery.customer)}><Navigation className="w-4 h-4 mr-2 text-blue-500" />Navigate</Button>
        </>}

        {delivery.status !== "Delivered" && delivery.status !== "Rejected" && <>
          <Button size="sm" variant="outline" onClick={() => onCall(delivery.customer.phone)}><Phone className="w-4 h-4 mr-2 text-green-500" />Call</Button>
          <Button size="sm" variant="outline" onClick={() => onViewDetails(delivery)}><User className="w-4 h-4 mr-2 text-indigo-500" />Details</Button>
        </>}
      </div>
    </div>
  );
};

const CustomerDetailsDialog: React.FC<CustomerDetailsDialogProps> = ({ delivery, isOpen, onOpenChange }) => {
  if (!delivery) return null;
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Customer Details - {delivery.id}</DialogTitle>
          <DialogDescription>Contact and order information for this delivery.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-4 text-sm">
          <div className="p-3 bg-muted rounded-lg space-y-1">
            <p className="font-bold text-base">{delivery.customer.name}</p>
            <div className="flex items-center gap-2 text-muted-foreground"><Phone className="w-4 h-4" /><span>{delivery.customer.phone}</span></div>
            <div className="flex items-center gap-2 text-muted-foreground"><Mail className="w-4 h-4" /><span>{delivery.customer.email}</span></div>
          </div>
          <div className="flex items-start gap-2 pt-2"><Home className="w-4 h-4 mt-1 text-primary" /><span>{delivery.customer.address}</span></div>
          {delivery.specialInstructions && (
            <div className="pt-3 border-t mt-3">
              <p className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-1">Special Instructions</p>
              <p className="italic bg-yellow-50 dark:bg-yellow-950/20 p-2 rounded border border-yellow-100 dark:border-yellow-900/30">{delivery.specialInstructions}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

const RecentCompletionsCard: React.FC<RecentCompletionsCardProps> = ({ completions }) => (
  <Card>
    <CardHeader>
      <CardTitle>Recent Completions</CardTitle>
      <CardDescription>Your recently completed deliveries</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {completions.length > 0 ? completions.map((completion) => (
          <div key={completion.id} className="flex justify-between items-center p-2 rounded-lg hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="font-bold text-sm">{completion.id}</p>
                <p className="text-xs text-muted-foreground">{completion.time}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-sm text-green-600">₹{completion.earnings}</p>
              <p className="text-xs text-muted-foreground">{completion.duration}</p>
            </div>
          </div>
        )) : (
          <p className="text-sm text-center text-muted-foreground py-4">No recent completions found.</p>
        )}
      </div>
    </CardContent>
  </Card>
);

// ============================================================================
// Main DeliveryDashboard Page Component
// ============================================================================
export default function DeliveryDashboard() {
  const { user, logout } = useAuth();
  const { socket } = useSocket();
  const [orders, setOrders] = useState<Delivery[]>([]);
  const [recentCompletions, setRecentCompletions] = useState<RecentCompletion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);

  const loadData = async () => {
    if (!user?.id) return;
    const [activeOrders, completedOrders] = await Promise.all([
      deliveryApi.getActiveDeliveries(user.id),
      deliveryApi.getRecentCompletions(user.id)
    ]);
    // Filter out delivered ones for the active view just in case
    setOrders(activeOrders.filter(o => o.status !== 'Delivered'));
    setRecentCompletions(completedOrders);
    setIsLoading(false);
  };

  useEffect(() => {
    if (user?.id) {
      loadData();
    }
  }, [user]);

  // Socket management
  useEffect(() => {
    if (!socket || !user?.id) return;

    const handleOrderUpdated = (updatedOrder: any) => {
      // If it was assigned to this user, refresh
      if (updatedOrder.deliveryPartner === user.id) {
        toast.info(`Order ${updatedOrder.orderNumber} has been updated.`);
        loadData();
      }
    };

    const handleNewOrder = (newOrder: any) => {
      // If it's assigned to currently logged in user (unlikely at creation but possible in future logic)
      if (newOrder.deliveryPartner === user.id) {
        toast.success(`New order assigned: ${newOrder.orderNumber}!`);
        loadData();
      }
    };

    socket.on('order-updated', handleOrderUpdated);
    socket.on('new-order', handleNewOrder);

    return () => {
      socket.off('order-updated', handleOrderUpdated);
      socket.off('new-order', handleNewOrder);
    };
  }, [socket, user]);

  const handleStatusChange = async (orderId: string, newStatus: Delivery['status']) => {
    try {
      await deliveryApi.updateOrderStatus(orderId, newStatus);

      if (newStatus === 'Delivered') {
        toast.success(`Order Delivered!`);
        loadData(); // Refresh everything
      } else {
        setOrders(currentOrders => currentOrders.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
        toast.info(`Order status marked as ${newStatus}.`);
      }
    } catch (error: any) {
      console.error(`[DASHBOARD] Failed to update status for order ${orderId}:`, error);
      toast.error(`Failed to update status: ${error.message}`);
    }
  };


  // Dynamic Stats Calculation
  const stats = useMemo(() => {
    const dailyEarnings = recentCompletions.reduce((acc, curr) => acc + curr.earnings, 0);
    const pendingCount = orders.length;
    return {
      todayDeliveries: recentCompletions.length + pendingCount,
      completedCount: recentCompletions.length,
      pendingCount,
      todayEarnings: dailyEarnings,
    };
  }, [orders, recentCompletions]);

  if (!user || user.role !== "delivery_agent") { return <div className="p-8 text-center text-red-500 font-bold">Access Denied</div>; }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="text-xl font-medium animate-pulse">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <header className="border-b sticky top-0 z-10 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold">Q</div>
            <h1 className="text-xl font-bold tracking-tight">Delivery Agent - QuickDash AI</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-600 text-xs font-bold">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              ONLINE
            </div>
            <span className="text-sm font-medium hidden sm:inline-block">Hi, {user.name}</span>
            <Button variant="ghost" size="sm" onClick={logout} className="text-muted-foreground hover:text-destructive">Logout</Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatCard title="Today's Deliveries" value={stats.todayDeliveries} description={`${stats.completedCount} completed, ${stats.pendingCount} pending`} icon={Package} />
          <StatCard title="Today's Earnings" value={`₹${stats.todayEarnings}`} description="Based on completed orders" icon={DollarSign} />
          <StatCard title="Average Time" value="18 min" description="Real-time estimate" icon={Clock} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-none shadow-none bg-transparent">
              <CardHeader className="px-0 pt-0">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl font-bold">Active Deliveries</CardTitle>
                    <CardDescription>Real-time delivery assignments from dispatch</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-0 space-y-4">
                {orders.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {orders.map(delivery => (
                      <DeliveryCard
                        key={delivery.id}
                        delivery={delivery}
                        onStatusChange={handleStatusChange}
                        onNavigate={deliveryApi.startNavigation}
                        onCall={deliveryApi.callCustomer}
                        onViewDetails={setSelectedDelivery}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-muted/30 rounded-2xl border border-dashed">
                    <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-green-500" />
                    </div>
                    <p className="font-bold text-lg">All caught up!</p>
                    <p className="text-sm text-muted-foreground">Waiting for new assignments...</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <RecentCompletionsCard completions={recentCompletions} />
          </div>
        </div>
      </main>

      <CustomerDetailsDialog delivery={selectedDelivery} isOpen={!!selectedDelivery} onOpenChange={() => setSelectedDelivery(null)} />
    </div>
  );
}