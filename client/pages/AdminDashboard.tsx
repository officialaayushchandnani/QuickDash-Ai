import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

// FIX: Added the missing imports for all tab components
import { OverviewTab } from "@/components/admin/OverviewTab";
import { ProductManagementTab } from "@/components/admin/ProductManagementTab";
import { CustomerManagementTab } from "@/components/admin/CustomerManagementTab";
import { AgentManagementTab } from "@/components/admin/AgentManagementTab";
import { ZoneManagementTab } from "@/components/admin/ZoneManagementTab";
import OrderManagementTab from "@/components/admin/OrderManagementTab";


// The component exported from a "pages" file is the page itself.
export default function AdminDashboardPage() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  if (!user || user.role !== "admin") {
    // ...
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        {/* ... */}
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* FIX: Corrected onValue-change to onValueChange */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="overflow-x-auto pb-2">
            <TabsList className="flex w-full min-w-max justify-start h-auto p-1 bg-muted/50 rounded-lg">
              <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
              <TabsTrigger value="orders" className="flex-1">Orders</TabsTrigger>
              <TabsTrigger value="products" className="flex-1">Products</TabsTrigger>
              <TabsTrigger value="customers" className="flex-1">Customers</TabsTrigger>
              <TabsTrigger value="agents" className="flex-1">Agents</TabsTrigger>
              <TabsTrigger value="zones" className="flex-1">Zones</TabsTrigger>
            </TabsList>
          </div>


          {/* Render the correct tab component based on the active state */}
          {/* FIX: Added all five tab components to be rendered */}
          {activeTab === "overview" && <OverviewTab />}
          {activeTab === "orders" && <OrderManagementTab />} {/* New Component */}
          {activeTab === "products" && <ProductManagementTab />}
          {activeTab === "customers" && <CustomerManagementTab />}
          {activeTab === "agents" && <AgentManagementTab />}
          {activeTab === "zones" && <ZoneManagementTab />}

        </Tabs>
      </div>
    </div>
  );
}