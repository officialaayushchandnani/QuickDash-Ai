import { RequestHandler } from "express";
import Order, { IOrder } from "../models/Order";

export const getOrders: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.query;
    const filter = userId ? { userId } : {};
    
    const orders = await Order.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch orders' });
  }
};

export const getOrderById: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    res.json({ success: true, data: order });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch order' });
  }
};

export const createOrder: RequestHandler = async (req, res) => {
  try {
    const orderData = req.body;
    
    // Generate order number
    const orderCount = await Order.countDocuments();
    const orderNumber = `QD${new Date().getFullYear()}${String(orderCount + 1).padStart(6, '0')}`;
    
    // Set estimated delivery (30 minutes from now)
    const estimatedDelivery = new Date();
    estimatedDelivery.setMinutes(estimatedDelivery.getMinutes() + 30);
    
    const order = new Order({
      ...orderData,
      orderNumber,
      estimatedDelivery,
    });
    
    const savedOrder = await order.save();
    
    res.status(201).json({ success: true, data: savedOrder });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ success: false, message: 'Failed to create order' });
  }
};

export const updateOrderStatus: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const updateData: any = { status };
    
    // Set actual delivery time if status is delivered
    if (status === 'delivered') {
      updateData.actualDelivery = new Date();
      updateData.paymentStatus = 'paid';
    }
    
    const order = await Order.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    res.json({ success: true, data: order });
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ success: false, message: 'Failed to update order' });
  }
};

export const deleteOrder: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findByIdAndDelete(id);
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    res.json({ success: true, message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ success: false, message: 'Failed to delete order' });
  }
};
