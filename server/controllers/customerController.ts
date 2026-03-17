import { Request, Response } from 'express';
import User from '../models/User';
import Order from '../models/Order';
import asyncHandler from '../utils/asyncHandler';

export const getCustomers = asyncHandler(async (req: Request, res: Response) => {
  const customers = await User.find({ role: 'customer' }).select('-password');

  // Aggregate order stats (count and total spend) for all users
  const orderStats = await Order.aggregate([
    {
      $group: {
        _id: { $toString: '$userId' },
        orderCount: { $sum: 1 },
        totalSpent: { $sum: '$total' }
      }
    }
  ]);

  // Transform User documents to the Customer type expected by the frontend
  const formattedCustomers = customers.map(user => {
    // Find matching stats in the aggregation result (comparing as strings)
    const stats = orderStats.find(s => s._id === user._id.toString()) || { orderCount: 0, totalSpent: 0 };

    return {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone || 'N/A',
      status: 'Active', // Default status
      orders: stats.orderCount,
      totalSpent: stats.totalSpent,
      joinDate: user.createdAt,
    };
  });

  res.status(200).json(formattedCustomers);
});

export const getCustomerById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const user = await User.findOne({ _id: id, role: 'customer' }).select('-password');

  if (!user) {
    res.status(404).json({ message: 'Customer not found' });
    return;
  }

  // Get customer's orders count and total spent
  const orders = await Order.find({ userId: id });
  const totalSpent = orders.reduce((sum, order) => sum + (order.total || 0), 0);

  const customer = {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone || 'N/A',
    address: user.address || 'N/A',
    status: 'Active',
    orders: orders.length,
    totalSpent,
    joinDate: user.createdAt,
    lastOrder: orders.length > 0 ? orders[orders.length - 1].createdAt : null,
    favoriteCategory: 'N/A',
    recentOrders: orders.slice(-5).reverse().map(order => ({
      id: order.orderNumber || order._id,
      date: order.createdAt,
      amount: order.total,
      status: order.status,
    })),
  };

  res.status(200).json(customer);
});
