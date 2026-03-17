import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingCart,
  Package,
  Users,
  Truck,
  TrendingUp,
} from "lucide-react";
// FIX: We now only import the 'api' object from our service.
import { api } from "@/services/adminService";

/**
 * OverviewTab Component
 * Displays a high-level summary of the business with key metrics and recent activity.
 */
export function OverviewTab() {
  // FIX: We now hold the data in state and have a loading indicator.
  const [stats, setStats] = useState<{
    products: number;
    customers: number;
    agents: number;
    activeAgents: number;
    totalOrders: number;
    totalRevenue: number;
    recentOrders: any[];
    zones: any[];
  }>({
    products: 0,
    customers: 0,
    agents: 0,
    activeAgents: 0,
    totalOrders: 0,
    totalRevenue: 0,
    recentOrders: [],
    zones: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  // FIX: We fetch all the data needed for the overview when the component loads.
  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        // Fetch all data in parallel for performance
        const [
          productsData,
          customersData,
          agentsData,
          zonesData,
          overviewData
        ] = await Promise.all([
          api.getProducts(),
          api.getCustomers(),
          api.getDeliveryAgents(),
          api.getZones(),
          api.getDashboardOverview()
        ]);

        setStats({
          products: productsData.length,
          customers: customersData.length,
          agents: agentsData.length,
          activeAgents: agentsData.filter((a: any) => a.status === 'Active').length,
          totalOrders: overviewData.totalOrders,
          totalRevenue: overviewData.totalRevenue,
          recentOrders: overviewData.recentOrders,
          zones: zonesData,
        });
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-4 w-4 rounded-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-[60px] mb-2" />
                <Skeleton className="h-3 w-[80px]" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-[300px] w-full rounded-xl" />
          <Skeleton className="h-[300px] w-full rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top row of summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">Historical total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.products}</div>
            <p className="text-xs text-muted-foreground">Live in store</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.customers}</div>
            <p className="text-xs text-muted-foreground">5 new this week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivery Agents</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.agents}</div>
            <p className="text-xs text-muted-foreground">{stats.activeAgents} active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.totalRevenue}</div>
            <p className="text-xs text-muted-foreground">Historical total</p>
          </CardContent>
        </Card>
      </div>

      {/* Bottom row with recent orders and zone status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Recent Orders</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentOrders.length > 0 ? (
                stats.recentOrders.map((order: any) => (
                  <div key={order._id} className="flex justify-between items-center border-b pb-2 last:border-0 last:pb-0">
                    <div>
                      <p className="font-medium text-sm">{order.orderNumber}</p>
                      <p className="text-xs text-muted-foreground">{order.userId?.name || 'Guest'}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm">₹{order.total}</p>
                      <Badge variant="outline" className="text-[10px] h-4 mt-1">{order.status}</Badge>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground py-4 text-center">No orders found.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Delivery Zones Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.zones.slice(0, 5).map((zone: any) => (
                <div key={zone.id} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{zone.name}</p>
                    <p className="text-sm text-muted-foreground">{zone.orders} orders</p>
                  </div>
                  <Badge variant={zone.isActive ? "default" : "secondary"}>
                    {zone.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}