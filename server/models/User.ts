import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import { UserRole } from '@/shared/types';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string; // Password is required on the document
  role: UserRole;
  phone?: string;
  address?: string;
  vehicleNumber?: string;
  status?: 'Active' | 'Inactive';
  matchPassword(enteredPassword: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['customer', 'delivery_agent', 'admin'], required: true },
  phone: {
    type: String,
    validate: {
      validator: function (v: string) {
        return /^\d{10}$/.test(v);
      },
      message: (props: any) => `${props.value} is not a valid 10-digit phone number!`
    }
  },
  address: { type: String },
  vehicleNumber: { type: String },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
}, { timestamps: true });

// This middleware automatically hashes the password before any 'save' operation.
UserSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// This method securely compares the entered password with the hashed password.
UserSchema.methods.matchPassword = async function (enteredPassword: string): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);