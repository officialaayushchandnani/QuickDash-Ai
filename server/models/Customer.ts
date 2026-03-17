import mongoose, { Schema, Document } from 'mongoose';

export interface ICustomer extends Document {
  name: string;
  email: string;
  phone: string;
  status: "Active" | "VIP";
  address: string;
}

const CustomerSchema: Schema = new Schema({
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
  status: { type: String, enum: ["Active", "VIP"], default: "Active" },
  address: { type: String },
}, { timestamps: true });

export default mongoose.models.Customer || mongoose.model<ICustomer>('Customer', CustomerSchema);