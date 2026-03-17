import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  price: number;
  image: string;
  category: string;
  description: string;
  stock: number;
  deliveryTime: string;
  rating: number;
  reviews: number;
  company?: string;
  size?: string;
  tags?: string[];
}

const ProductSchema: Schema = new Schema({
  name: { type: String, required: true, trim: true, index: true },
  price: { type: Number, required: true, min: 0 },
  image: { type: String, required: true },
  category: { type: String, required: true, index: true },
  description: { type: String, required: true },
  stock: { type: Number, required: true, min: 0 },
  deliveryTime: { type: String, required: true },
  rating: { type: Number, default: 0 },
  reviews: { type: Number, default: 0 },
  company: { type: String },
  size: { type: String },
  tags: { type: [String], index: true },
}, { timestamps: true });

export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);