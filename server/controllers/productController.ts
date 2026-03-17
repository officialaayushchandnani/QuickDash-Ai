import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Product from '../models/Product';
import asyncHandler from '../utils/asyncHandler';

// GET /api/products - Fetches all products
export const getProducts = asyncHandler(async (req: Request, res: Response) => {
  const products = await Product.find({});
  res.status(200).json(products);
});

// POST /api/products - Creates a new product
export const createProduct = asyncHandler(async (req: Request, res: Response) => {
  const productData = req.body;

  if (!productData.name || !productData.price || !productData.category) {
    res.status(400); // Bad Request
    throw new Error('Please provide name, price, and category for the product.');
  }

  const product = new Product({
    ...productData,
    rating: 4.5, // Set default server-side
    reviews: 0,
  });

  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
});

// PUT /api/products/:id - Updates a product
export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const productData = req.body;
  const updatedProduct = await Product.findByIdAndUpdate(id, productData, { new: true, runValidators: true });

  if (updatedProduct) {
    res.status(200).json(updatedProduct);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});
export const getProductById = asyncHandler(async (req: Request, res: Response) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    res.status(200).json(product);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// DELETE /api/products/:id - Deletes a product
export const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  console.log(`[DELETE] Attempting to delete product with ID: ${id}`);

  if (!mongoose.Types.ObjectId.isValid(id)) {
    console.error(`[DELETE] Invalid Product ID format: ${id}`);
    res.status(400);
    throw new Error('Invalid Product ID format');
  }

  const deletedProduct = await Product.findByIdAndDelete(id);

  if (deletedProduct) {
    console.log(`[DELETE] Successfully deleted product: ${id}`);
    res.status(200).json({ message: 'Product removed' });
  } else {
    console.warn(`[DELETE] Product not found for deletion: ${id}`);
    res.status(404);
    throw new Error('Product not found');
  }
});
