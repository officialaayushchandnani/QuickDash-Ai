import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, MapPin, Clock, Truck, CheckCircle, Package, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
    Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { api } from '@/services/adminService';
import { Order, DeliveryAgent } from '@/types';
import { useSocket } from '@/contexts/SocketContext';
import { toast } from 'sonner';

export default function OrderManagementTab() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [deliveryAgents, setDeliveryAgents] = useState<DeliveryAgent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const { socket } = useSocket();

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (!socket) return;

        socket.on('new-order', (newOrder: Order) => {
            setOrders(prev => [newOrder, ...prev]);
            toast.success(`New order received: ${newOrder.orderNumber}`);
        });

        socket.on('order-updated', (updatedOrder: Order) => {
            setOrders(prev => prev.map(o => o._id === updatedOrder._id ? updatedOrder : o));
        });

        return () => {
            socket.off('new-order');
            socket.off('order-updated');
        };
    }, [socket]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [ordersData, agentsData] = await Promise.all([
                api.getOrders(),
                api.getDeliveryAgents()
            ]);
            setOrders(ordersData);
            setDeliveryAgents(agentsData);
        } catch (error) {
            console.error("Failed to fetch data", error);
            toast.error("Failed to fetch orders");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAssignAgent = async (orderId: string, agentId: string) => {
        try {
            await api.assignOrder(orderId, agentId);
            toast.success("Delivery partner assigned successfully");
        } catch (error) {
            toast.error("Failed to assign delivery partner");
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch =
            (order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50';
            case 'confirmed': return 'bg-blue-500/20 text-blue-500 border-blue-500/50';
            case 'preparing': return 'bg-purple-500/20 text-purple-500 border-purple-500/50';
            case 'accepted': return 'bg-cyan-500/20 text-cyan-500 border-cyan-500/50';
            case 'out_for_delivery': return 'bg-orange-500/20 text-orange-500 border-orange-500/50';
            case 'delivered': return 'bg-green-500/20 text-green-500 border-green-500/50';
            case 'cancelled': return 'bg-red-500/20 text-red-500 border-red-500/50';
            default: return 'bg-gray-500/20 text-gray-500';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                        placeholder="Search orders..."
                        className="pl-10 bg-muted/50 border-white/10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full md:w-48 bg-muted/50 border-white/10">
                            <SelectValue placeholder="Filter by Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="preparing">Preparing (Assigned)</SelectItem>
                            <SelectItem value="accepted">Accepted</SelectItem>
                            <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="outline" size="icon" onClick={fetchData} className="border-white/10 hover:bg-white/5">
                        <Filter className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="h-64 rounded-xl bg-muted/20 animate-pulse" />
                    ))}
                </div>
            ) : filteredOrders.length === 0 ? (
                <div className="text-center py-20 bg-muted/10 rounded-xl border border-dashed border-white/10">
                    <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-xl font-medium mb-1">No orders found</h3>
                    <p className="text-muted-foreground">Try adjusting your filters or search terms</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {filteredOrders.map((order) => (
                            <motion.div
                                key={order._id || order.id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                            >
                                <Card className="glass border-white/5 overflow-hidden hover:border-brand-green/20 transition-all duration-300">
                                    <CardHeader className="pb-3 bg-muted/30">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <CardTitle className="text-lg font-bold flex items-center gap-2">
                                                    {order.orderNumber}
                                                </CardTitle>
                                                <CardDescription className="text-xs mt-1">
                                                    {new Date(order.createdAt || Date.now()).toLocaleString()}
                                                </CardDescription>
                                            </div>
                                            <Badge variant="outline" className={`${getStatusColor(order.status)} border-0`}>
                                                {order.status.replace(/_/g, ' ')}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-4 space-y-4">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-muted-foreground">Customer</span>
                                            <span className="font-medium">{order.customerName || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-muted-foreground">Items</span>
                                            <span className="font-medium">{order.items.length} items</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-muted-foreground">Total</span>
                                            <span className="font-bold text-brand-green">${order.total.toFixed(2)}</span>
                                        </div>
                                        <div className="pt-2 border-t border-white/5 space-y-2">
                                            <div className="flex items-start gap-2 text-xs text-muted-foreground">
                                                <MapPin className="h-3 w-3 mt-0.5 shrink-0" />
                                                <span className="line-clamp-2">{order.deliveryAddress}</span>
                                            </div>
                                            {order.deliveryPartner ? (
                                                <div className="flex items-center gap-2 text-xs text-brand-blue">
                                                    <Truck className="h-3 w-3" />
                                                    <span>Assigned to: {
                                                        // Find agent name if populated or in list
                                                        typeof order.deliveryPartner === 'object'
                                                            ? (order.deliveryPartner as any).name
                                                            : deliveryAgents.find(a => (a._id || a.id) === order.deliveryPartner)?.name || 'Unknown Agent'
                                                    }</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 text-xs text-yellow-500">
                                                    <AlertCircle className="h-3 w-3" />
                                                    <span>Unassigned</span>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                    <CardFooter className="bg-muted/30 pt-4">
                                        {order.status === 'pending' || order.status === 'confirmed' ? (
                                            !order.deliveryPartner && (
                                                <Select onValueChange={(agentId) => handleAssignAgent((order._id || order.id) as string, agentId)}>
                                                    <SelectTrigger className="w-full h-9 bg-background/50 text-xs">
                                                        <SelectValue placeholder="Assign Delivery Partner" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {deliveryAgents
                                                            .filter(agent => {
                                                                const s = agent.status.toLowerCase();
                                                                return ['available', 'idle', 'active', 'online'].includes(s);
                                                            })
                                                            .map(agent => (
                                                                <SelectItem key={(agent._id || agent.id) as string} value={(agent._id || agent.id) as string}>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="w-2 h-2 rounded-full bg-green-500" />
                                                                        {agent.name}
                                                                    </div>
                                                                </SelectItem>
                                                            ))}
                                                    </SelectContent>
                                                </Select>
                                            )
                                        ) : (
                                            <div className="w-full text-center text-xs text-muted-foreground">
                                                {order.status === 'delivered' ? (
                                                    <span className="flex items-center justify-center gap-1 text-green-500">
                                                        <CheckCircle className="h-3 w-3" /> Completed
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center justify-center gap-1 text-brand-blue">
                                                        <Clock className="h-3 w-3" /> In Progress
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </CardFooter>
                                </Card>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}
