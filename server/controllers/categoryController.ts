import { Request, Response } from 'express';
import Category from '../models/Category';
import asyncHandler from '../utils/asyncHandler';

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
export const getCategories = asyncHandler(async (req: Request, res: Response) => {
    const categories = await Category.find({}).sort({ name: 1 });
    // Map to simple array of strings if client expects that, or full objects
    // For now return full objects to support images later
    res.status(200).json(categories);
});

// @desc    Create a category
// @route   POST /api/categories
// @access  Private/Admin
export const createCategory = asyncHandler(async (req: Request, res: Response) => {
    const { name, image } = req.body;

    if (!name) {
        res.status(400);
        throw new Error('Please add a category name');
    }

    const categoryExists = await Category.findOne({ name });
    if (categoryExists) {
        res.status(400);
        throw new Error('Category already exists');
    }

    const category = await Category.create({
        name,
        image
    });

    res.status(201).json(category);
});
