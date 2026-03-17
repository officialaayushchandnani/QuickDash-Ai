import mongoose, { Schema, Document } from 'mongoose';

export interface IZone extends Document {
  name: string;
  area: string;
  isActive: boolean;
}

const ZoneSchema: Schema = new Schema({
  name: { type: String, required: true, unique: true },
  area: { type: String, required: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.models.Zone || mongoose.model<IZone>('Zone', ZoneSchema);