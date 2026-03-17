import { Router } from 'express';
import {
  getMyOrders,
  createOrder,
  getAllOrders,
  assignDeliveryPartner,
  getAgentOrders,
  updateOrderStatus,
  getDashboardStats
} from '../controllers/orderController';

const orderRouter = Router();

// Define the routes for the /api/orders endpoint
orderRouter.get('/', getMyOrders);
orderRouter.post('/', createOrder);
orderRouter.get('/all', getAllOrders); // Admin route to get all orders
orderRouter.put('/:id/assign', assignDeliveryPartner); // Admin route to assign partner
orderRouter.get('/agent/:agentId', getAgentOrders); // Agent route
orderRouter.patch('/:id/status', updateOrderStatus); // Agent route to update status
orderRouter.get('/stats/overview', getDashboardStats); // Admin route for dashboard stats


export default orderRouter;