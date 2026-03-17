import mongoose, { Schema, Document } from 'mongoose';

export interface IAgent extends Document {
  name: string;
  email: string;
  phone: string;
  vehicleNumber: string;
  status: 'Active' | 'Inactive';
  rating: number;
}

const AgentSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: {
    type: String,
    validate: {
      validator: function (v: string) {
        return /^\d{10}$/.test(v);
      },
      message: (props: any) => `${props.value} is not a valid 10-digit phone number!`
    }
  },
  vehicleNumber: { type: String },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  rating: { type: Number, default: 4.5 },
}, { timestamps: true });

export default mongoose.models.Agent || mongoose.model<IAgent>('Agent', AgentSchema);