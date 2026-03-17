import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { api } from "@/services/adminService";
import { DeliveryAgent } from "@/types";
import { toast } from "sonner";
import {
  Eye,
  Mail,
  Phone,
  Truck,
  MapPin,
  Calendar,
  DollarSign,
  Star,
  Package,
  Home,
} from "lucide-react";

export function AgentManagementTab() {
  const [agents, setAgents] = useState<DeliveryAgent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<DeliveryAgent | null>(null);

  useEffect(() => {
    const fetchAgents = async () => {
      setIsLoading(true);
      try {
        const data = await api.getDeliveryAgents();
        setAgents(data);
      } catch (error) {
        console.error("Failed to fetch delivery agents:", error);
        toast.error("Could not load delivery agent data.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchAgents();
  }, []);

  const handleToggleStatus = async (agentId: string) => {
    const agentName = agents.find(a => a.id === agentId)?.name;
    try {
      const result = await api.toggleAgentStatus(agentId);
      setAgents(currentAgents =>
        currentAgents.map(agent =>
          agent.id === agentId
            ? { ...agent, status: result.status as 'Active' | 'Inactive' }
            : agent
        )
      );
      toast.success(`Status updated for ${agentName}`);
    } catch (error) {
      console.error("Failed to toggle agent status:", error);
      toast.error(`Failed to update status for ${agentName}`);
    }
  };

  if (isLoading) {
    return <div className="p-4 text-center text-muted-foreground">Loading delivery agents...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Delivery Agents Management</h2>
        <div className="text-sm text-muted-foreground">
          Total Agents: {agents.length}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((agent) => (
          <Card key={agent.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{agent.name}</CardTitle>
                  <CardDescription>{agent.email}</CardDescription>
                </div>
                <Badge variant={agent.status === 'Active' ? 'default' : 'secondary'}>
                  {agent.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-3">
                <Truck className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">{agent.vehicleNumber}</span>
              </div>
              <div className="flex items-center justify-center gap-1 my-2">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">{agent.rating} rating</span>
              </div>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => setSelectedAgent(agent)}>
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </Button>
                <Button
                  variant={agent.status === 'Active' ? 'destructive' : 'default'}
                  size="sm"
                  className="flex-1"
                  onClick={() => handleToggleStatus(agent.id)}
                >
                  {agent.status === 'Active' ? 'Deactivate' : 'Activate'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!selectedAgent} onOpenChange={() => setSelectedAgent(null)}>
        {selectedAgent && (
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{selectedAgent.name}</DialogTitle>
              <DialogDescription>Details for delivery agent.</DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-4 text-sm">
              <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-muted-foreground" /><span>{selectedAgent.phone}</span></div>
              <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-muted-foreground" /><span>{selectedAgent.email}</span></div>
              <div className="flex items-start gap-2"><Home className="w-4 h-4 mt-1 text-muted-foreground" /><span>{selectedAgent.address}</span></div>
              <div className="flex items-center gap-2"><Truck className="w-4 h-4 text-muted-foreground" /><span>{selectedAgent.vehicleNumber}</span></div>
              <div className="flex items-center gap-2"><Package className="w-4 h-4 text-muted-foreground" /><span>{selectedAgent.totalDeliveries} total deliveries</span></div>
              <div className="flex items-center gap-2"><DollarSign className="w-4 h-4 text-muted-foreground" /><span>₹{selectedAgent.earnings} total earnings</span></div>
              <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-muted-foreground" /><span>Joined {new Date(selectedAgent.joinDate).toLocaleDateString()}</span></div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}