import { Request, Response } from 'express';
import asyncHandler from '../utils/asyncHandler';
import User from '../models/User';

/**
 * @desc    Register a new user and save to the database
 * @route   POST /api/auth/register
 */
export const registerUser = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, role, phone, address, vehicleNumber } = req.body;

  // Check if all required fields are provided
  if (!name || !email || !password || !role) {
    res.status(400); // Bad Request
    throw new Error('Please provide all required fields: name, email, password, and role.');
  }

  // Validate phone number if provided (exactly 10 digits)
  if (phone && !/^\d{10}$/.test(phone)) {
    res.status(400);
    throw new Error('Phone number must be exactly 10 digits');
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User with this email already exists');
  }

  // Create a new user document in memory
  const user = new User({
    name, email, password, role, phone, address, vehicleNumber
  });

  // Save the document to the MongoDB database. The password will be hashed automatically.
  const createdUser = await user.save();

  if (createdUser) {
    // Send back the user data (without the password)
    const { password, ...userWithoutPassword } = createdUser.toObject();

    // Emit socket event for real-time updates
    try {
      const { io } = await import('../index');
      if (io) {
        io.emit('new-customer', userWithoutPassword);
      }
    } catch (error) {
      console.error("Socket emit failed:", error);
    }

    res.status(201).json(userWithoutPassword);
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

/**
 * @desc    Authenticate a user (Login)
 * @route   POST /api/auth/login
 */
export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password: enteredPassword } = req.body;

  // We must use .select('+password') to retrieve the password hash from the DB
  const user = await User.findOne({ email }).select('+password');

  // Use the secure matchPassword method
  if (user && (await user.matchPassword(enteredPassword))) {
    const { password, ...userWithoutPassword } = user.toObject();
    res.status(200).json(userWithoutPassword);
  } else {
    res.status(401); // Unauthorized
    throw new Error('Invalid email or password');
  }
});