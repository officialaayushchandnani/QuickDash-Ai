import React from 'react';
import { Order } from '@/services/orderService';
import { Clock, CheckCircle, Package, Truck, XCircle } from 'lucide-react';

// This file contains helper functions related to displaying order status.

export const getStatusConfig = (status: Order['status']) => {
  switch (status) {
    case "pending":
      return { text: "Order Placed", icon: <Clock className="w-4 h-4" />, color: "bg-yellow-100 text-yellow-800" };
    case "confirmed":
      return { text: "Confirmed", icon: <CheckCircle className="w-4 h-4" />, color: "bg-blue-100 text-blue-800" };
    case "preparing":
      return { text: "Preparing", icon: <Package className="w-4 h-4" />, color: "bg-orange-100 text-orange-800" };
    case "out_for_delivery":
      return { text: "Out for Delivery", icon: <Truck className="w-4 h-4" />, color: "bg-purple-100 text-purple-800" };
    case "delivered":
      return { text: "Delivered", icon: <CheckCircle className="w-4 h-4" />, color: "bg-green-100 text-green-800" };
    case "cancelled":
      return { text: "Cancelled", icon: <XCircle className="w-4 h-4" />, color: "bg-red-100 text-red-800" };
    default:
      return { text: "Unknown", icon: <Clock className="w-4 h-4" />, color: "bg-gray-100 text-gray-800" };
  }
};