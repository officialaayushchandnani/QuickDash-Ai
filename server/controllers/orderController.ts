import { Request, Response } from 'express';
import asyncHandler from '../utils/asyncHandler';
import mongoose from 'mongoose';
import Order, { IOrder } from '../models/Order';
import User from '../models/User';

/**
 * @desc    Automatically assign a delivery partner to an order
 */
const autoAssignDeliveryPartner = async (order: IOrder) => {
  try {
    // 1. Get all delivery agents
    const agents = await User.find({ role: 'delivery_agent' });

    if (agents.length === 0) {
      console.log(`[AUTO_ASSIGN] No delivery agents found in system.`);
      return null;
    }

    // 2. Find agents who are currently available
    // An agent is available if they don't have any active orders (preparing, accepted, out_for_delivery)
    const activeOrders = await Order.find({
      deliveryPartner: { $exists: true, $ne: null },
      status: { $in: ['preparing', 'accepted', 'out_for_delivery'] }
    });

    const busyAgentIds = activeOrders.map(o => o.deliveryPartner?.toString());
    const availableAgents = agents.filter(agent => !busyAgentIds.includes(agent._id.toString()));

    if (availableAgents.length === 0) {
      console.log(`[AUTO_ASSIGN] All agents are currently busy.`);
      return null;
    }

    // 3. Pick the first available agent (could be improved with proximity or load balancing)
    const assignedAgent = availableAgents[0];

    // 4. Update the order
    order.deliveryPartner = assignedAgent._id as any;
    order.status = 'preparing';
    order.assignedAt = new Date();
    await order.save();

    console.log(`[AUTO_ASSIGN] Order ${order.orderNumber} automatically assigned to agent ${assignedAgent.name}`);
    return assignedAgent;
  } catch (error) {
    console.error("[AUTO_ASSIGN] Error during automatic assignment:", error);
    return null;
  }
};

/**
 * @desc    Get orders for the logged-in user
 * @route   GET /api/orders
 * @access  Private
 */
export const getMyOrders = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.query;

  // 1. If no userId is provided, it's not a valid request for this user's orders.
  if (!userId) {
    return res.status(200).json([]);
  }

  // 2. If the userId is not in a valid MongoDB ObjectId format, it cannot match any
  //    document in the database, so we can return early. This prevents CastErrors.
  if (!mongoose.Types.ObjectId.isValid(userId as string)) {
    return res.status(400).json({ message: "Invalid User ID format" });
  }

  // 3. If the userId is valid, query the database.
  const orders = await Order.find({ userId: userId })
    .sort({ createdAt: -1 }); // Sort by newest first

  // Map createdAt to date for frontend compatibility
  const ordersWithDate = orders.map(order => ({
    ...order.toObject(),
    date: (order as any).createdAt
  }));

  res.status(200).json(ordersWithDate);
});


/**
 * @desc    Create a new order
 * @route   POST /api/orders
 * @access  Private
 */
export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  const {
    userId,
    items,
    subtotal,
    deliveryFee,
    tax,
    discount,
    total,
    deliveryAddress,
    paymentMethod,
    customerName,
  } = req.body;

  if (!items || items.length === 0) {
    res.status(400);
    throw new Error("No order items provided");
  }

  // Validate that the userId is a valid ObjectId before creating the order
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    res.status(400);
    throw new Error("Invalid User ID provided for order");
  }

  const order = new Order({
    orderNumber: `QD${Date.now()}`,
    userId,
    customerName,
    items,
    subtotal,
    deliveryFee,
    tax,
    discount,
    total,
    deliveryAddress,
    paymentMethod,
  });

  const createdOrder = await order.save();

  // Automatically assign an available delivery partner
  await autoAssignDeliveryPartner(createdOrder);

  // Emit socket event for real-time updates
  try {
    const { io } = await import('../index');
    if (io) {
      // Re-fetch populated order if needed, or just emit the updated one
      const finalOrder = await Order.findById(createdOrder._id)
        .populate('userId', 'name email')
        .populate('deliveryPartner', 'name email phone');

      io.emit('new-order', finalOrder || createdOrder);
      if (finalOrder?.deliveryPartner) {
        io.emit('order-updated', finalOrder);
      }
    }
  } catch (error) {
    console.error("Socket emit failed:", error);
  }

  res.status(201).json({
    ...createdOrder.toObject(),
    date: (createdOrder as any).createdAt
  });
});

/**
 * @desc    Get all orders (Admin only)
 * @route   GET /api/orders/all
 * @access  Private/Admin
 */
export const getAllOrders = asyncHandler(async (_req: Request, res: Response) => {
  const orders = await Order.find({}).sort({ createdAt: -1 });

  const ordersWithDate = orders.map(order => ({
    ...order.toObject(),
    date: (order as any).createdAt
  }));

  res.status(200).json(ordersWithDate);
});

/**
 * @desc    Assign delivery partner to order
 * @route   PUT /api/orders/:id/assign
 * @access  Private/Admin
 */
export const assignDeliveryPartner = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { deliveryPartnerId } = req.body;

  const order = await Order.findById(id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  order.deliveryPartner = deliveryPartnerId;
  order.status = 'preparing';
  order.assignedAt = new Date();

  const updatedOrder = await order.save();

  // Notify everyone about the update
  try {
    const { io } = await import('../index');
    if (io) {
      io.emit('order-updated', updatedOrder);
    }
  } catch (error) {
    console.error("Socket emit failed:", error);
  }

  res.status(200).json(updatedOrder);
});

/**
 * @desc    Get orders assigned to a delivery partner
 * @route   GET /api/orders/agent/:agentId
 * @access  Private/Agent
 */
export const getAgentOrders = asyncHandler(async (req: Request, res: Response) => {
  const { agentId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(agentId)) {
    res.status(400);
    throw new Error('Invalid Agent ID');
  }

  const orders = await Order.find({
    deliveryPartner: agentId,
    status: { $nin: ['cancelled'] }
  })
    .populate('userId', 'name email phone address')
    .sort({ createdAt: -1 });

  res.status(200).json(orders);
});

/**
 * @desc    Update order status (by Agent)
 * @route   PATCH /api/orders/:id/status
 * @access  Private/Agent
 */
export const updateOrderStatus = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  console.log(`[STATUS_UPDATE] Attempting to update order ${id} to status: ${status}`);

  if (!mongoose.Types.ObjectId.isValid(id)) {
    console.error(`[STATUS_UPDATE] Invalid Order ID format: ${id}`);
    res.status(400);
    throw new Error('Invalid Order ID format');
  }

  const validStatuses = ['confirmed', 'preparing', 'accepted', 'out_for_delivery', 'delivered', 'cancelled'];
  if (!validStatuses.includes(status)) {
    console.error(`[STATUS_UPDATE] Invalid status requested: ${status}`);
    res.status(400);
    throw new Error('Invalid status');
  }

  const order = await Order.findById(id);

  if (!order) {
    console.warn(`[STATUS_UPDATE] Order not found: ${id}`);
    res.status(404);
    throw new Error('Order not found');
  }

  const oldStatus = order.status;
  order.status = status;
  const updatedOrder = await order.save();

  console.log(`[STATUS_UPDATE] Success: Order ${id} changed from ${oldStatus} to ${status}`);

  // Emit socket event for real-time updates
  try {
    const { io } = await import('../index');
    if (io) {
      io.emit('order-updated', updatedOrder);
    }
  } catch (error) {
    console.error("[STATUS_UPDATE] Socket emit failed:", error);
  }

  res.status(200).json(updatedOrder);
});

/**
 * @desc    Get dashboard summary statistics for Admin
 * @route   GET /api/orders/stats/overview
 * @access  Private/Admin
 */
export const getDashboardStats = asyncHandler(async (_req: Request, res: Response) => {
  const totalOrders = await Order.countDocuments({});

  // Calculate total revenue
  const revenueData = await Order.aggregate([
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$total' }
      }
    }
  ]);

  const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

  // Get recent 5 orders with populated customer names
  const recentOrders = await Order.find({})
    .populate('userId', 'name')
    .sort({ createdAt: -1 })
    .limit(5);

  res.status(200).json({
    totalOrders,
    totalRevenue,
    recentOrders
  });
});

