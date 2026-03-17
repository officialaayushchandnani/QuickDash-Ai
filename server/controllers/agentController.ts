import { Request, Response } from 'express';
import User from '../models/User';
import asyncHandler from '../utils/asyncHandler';

export const getAgents = asyncHandler(async (req: Request, res: Response) => {
  const agents = await User.find({ role: 'delivery_agent' }).select('-password');

  // Transform User documents to the DeliveryAgent type expected by the frontend
  const formattedAgents = agents.map(user => ({
    _id: user._id,
    id: user._id, // Support both formats
    name: user.name,
    email: user.email,
    phone: user.phone || 'N/A',
    vehicleNumber: user.vehicleNumber || 'N/A',
    status: user.status || 'Active',
    rating: 4.5, // Default rating
  }));

  res.status(200).json(formattedAgents);
});

export const toggleAgentStatus = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const agent = await User.findOne({ _id: id, role: 'delivery_agent' });

  if (!agent) {
    res.status(404).json({ message: 'Delivery agent not found' });
    return;
  }

  // Treat undefined/null as 'Active' (the default for pre-existing agents)
  const currentStatus = agent.status || 'Active';
  agent.status = currentStatus === 'Active' ? 'Inactive' : 'Active';
  await agent.save();

  res.status(200).json({ id: agent._id, status: agent.status });
});
