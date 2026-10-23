import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IVehicleDocument extends Document {
  vehicleRegNo: string;
  vehicleType: string;
  vehicleName: string;
  initialMeterReading: number;
  currentMeterReading: number;
  fuelType: 'Petrol' | 'Diesel' | 'LNG';
  vehicleImage?: string;
  isActive: boolean;
  assignedDrivers: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const VehicleSchema = new Schema<IVehicleDocument>(
  {
    vehicleRegNo: { type: String, required: true, unique: true, uppercase: true, trim: true },
    vehicleType: { type: String, required: true, default: 'Van' },
    vehicleName: { type: String, required: true, trim: true },
    initialMeterReading: { type: Number, required: true, default: 0 },
    currentMeterReading: { type: Number, required: true, default: 0 },
    fuelType: { type: String, enum: ['Petrol', 'Diesel', 'LNG'], default: 'Diesel' },
    vehicleImage: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    assignedDrivers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

export const Vehicle: Model<IVehicleDocument> =
  mongoose.models.Vehicle || mongoose.model<IVehicleDocument>('Vehicle', VehicleSchema);

export default Vehicle;
