import { Request, Response } from 'express';
import asyncHandler from '../utils/asyncHandler';
import bcrypt from 'bcryptjs';
import Product from '../models/Product';
import Category from '../models/Category';
import User from '../models/User';
import Order from '../models/Order';
import { demoProducts, demoCategories, demoDeliveryAgents, demoCustomers } from './seed';

export const seedDatabase = asyncHandler(async (req: Request, res: Response) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ message: 'Seeding is disabled in production.' });
  }

  await Product.deleteMany({});
  await Category.deleteMany({});
  await Order.deleteMany({});
  // Clear delivery agents and customers to avoid duplicates, but keep admin users
  await User.deleteMany({ role: { $in: ['delivery_agent', 'customer'] } });

  const createdProducts = await Product.insertMany(demoProducts);
  const createdCategories = await Category.insertMany(demoCategories);

  // Pre-hash the default password since insertMany bypasses Mongoose middleware
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('password123', salt);

  // Seed Delivery Agents as Users
  const agentsToSeed = demoDeliveryAgents.map(agent => ({
    name: agent.name,
    email: agent.email,
    password: hashedPassword,
    role: 'delivery_agent',
    phone: agent.phone,
    vehicleNumber: agent.vehicleNumber,
    address: agent.address,
    status: 'Active',
  }));

  const createdAgents = await User.insertMany(agentsToSeed);

  // Seed Customers as Users
  const customersToSeed = demoCustomers.map(customer => ({
    name: customer.name,
    email: customer.email,
    password: hashedPassword,
    role: 'customer',
    phone: customer.phone,
    address: customer.address,
    status: 'Active',
  }));

  const createdCustomers = await User.insertMany(customersToSeed);

  res.status(201).json({
    message: `Database seeded successfully with ${createdProducts.length} products, ${createdCategories.length} categories, ${createdAgents.length} delivery agents, and ${createdCustomers.length} customers.`,
    data: {
      products: createdProducts,
      categories: createdCategories,
      agents: createdAgents,
      customers: createdCustomers
    }
  });
});