import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IOrderItem {
  productId: Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface IOrder extends Document {
  orderNumber: string;
  userId: Types.ObjectId;
  customerName: string;
  items: IOrderItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'accepted' | 'out_for_delivery' | 'delivered' | 'cancelled';

  paymentMethod: string;
  deliveryAddress: string;
  deliveryPartner?: Types.ObjectId;
  assignedAt?: Date;
  specialInstructions?: string;
}

const OrderItemSchema: Schema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  image: { type: String },
}, { _id: false });

const OrderSchema: Schema = new Schema({
  orderNumber: { type: String, required: true, unique: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  customerName: { type: String, required: true },
  items: [OrderItemSchema],
  total: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ['pending', 'confirmed', 'preparing', 'accepted', 'out_for_delivery', 'delivered', 'cancelled'], default: 'pending' },

  paymentMethod: { type: String, required: true },
  deliveryAddress: { type: String, required: true },
  deliveryPartner: { type: Schema.Types.ObjectId, ref: 'User' },
  assignedAt: { type: Date },
  specialInstructions: { type: String, default: '' },
}, {
  timestamps: true,
});

// FIX: Add the hot-reload protection to prevent server restart crashes.
export default mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);