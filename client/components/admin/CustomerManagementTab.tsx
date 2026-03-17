import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/services/adminService"; // FIX: Import the 'api' object
import { Customer } from "@/types"; // FIX: Import the Customer type
import { toast } from "sonner";
import {
  Eye,
  Mail,
  Phone,
  ShoppingCart,
  DollarSign,
  Calendar,
} from "lucide-react";

/**
 * CustomerManagementTab Component
 * Displays a list of all customers and provides basic information and actions.
 */
import { useSocket } from "@/contexts/SocketContext";

// ... (inside component)

export function CustomerManagementTab() {
  const navigate = useNavigate();
  // FIX: Start with an empty array and a loading state.
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { socket } = useSocket();

  // FIX: Fetch the customer data from the API when the component loads.
  useEffect(() => {
    const fetchCustomers = async () => {
      setIsLoading(true);
      try {
        const data = await api.getCustomers();
        setCustomers(data);
      } catch (error) {
        console.error("Failed to fetch customers:", error);
        toast.error("Could not load customer data.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on('new-customer', (newCustomer: Customer) => {
      // Only add to list if role is customer/user, assumed from event context or check role if available
      // For now assuming all emitted 'new-customer' are relevant
      setCustomers(prev => [newCustomer, ...prev]);
      toast.success(`New customer registered: ${newCustomer.name}`);
    });

    return () => {
      socket.off('new-customer');
    };
  }, [socket]);

  if (isLoading) {
    return <div className="p-4 text-center text-muted-foreground">Loading customers...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Customer Management</h2>
        <div className="text-sm text-muted-foreground">
          Total Customers: {customers.length}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer List</CardTitle>
          <CardDescription>View and manage customer information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {customers.map((customer) => (
              <div key={customer.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{customer.name}</h4>
                      <Badge variant={customer.status === "VIP" ? "default" : "secondary"}>
                        {customer.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span>{customer.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span>{customer.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ShoppingCart className="w-4 h-4 text-muted-foreground" />
                        <span>{customer.orders} orders</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-muted-foreground" />
                        <span>₹{customer.totalSpent} spent</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>Joined {new Date(customer.joinDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/admin/customer/${customer.id}`)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}