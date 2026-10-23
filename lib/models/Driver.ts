import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDriverDocument extends Document {
  userId: mongoose.Types.ObjectId;
  licenseNumber?: string;
  licenseExpiry?: Date;
  assignedVehicles: mongoose.Types.ObjectId[];
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DriverSchema = new Schema<IDriverDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    licenseNumber: { type: String, default: '' },
    licenseExpiry: { type: Date },
    assignedVehicles: [{ type: Schema.Types.ObjectId, ref: 'Vehicle' }],
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Driver: Model<IDriverDocument> =
  mongoose.models.Driver || mongoose.model<IDriverDocument>('Driver', DriverSchema);

export default Driver;
