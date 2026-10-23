import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUserDocument extends Document {
  fullName: string;
  email: string;
  password?: string;
  phone?: string;
  role: 'admin' | 'passenger' | 'driver';
  department?: string;
  employeeId?: string;
  profileImage?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUserDocument>(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    phone: { type: String, default: '' },
    role: { type: String, enum: ['admin', 'passenger', 'driver'], default: 'passenger' },
    department: { type: String, default: '' },
    employeeId: { type: String, default: '' },
    profileImage: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const User: Model<IUserDocument> =
  mongoose.models.User || mongoose.model<IUserDocument>('User', UserSchema);

export default User;
