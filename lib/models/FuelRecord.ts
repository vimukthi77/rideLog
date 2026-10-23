import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IFuelRecordDocument extends Document {
  vehicle: mongoose.Types.ObjectId;
  date: Date;
  fuelQuantity: number;
  kmReadingAtFueling: number;
  kmDoneSinceLastFueling: number;
  cost: number;
  createdAt: Date;
}

const FuelRecordSchema = new Schema<IFuelRecordDocument>(
  {
    vehicle: { type: Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    date: { type: Date, default: () => new Date() },
    fuelQuantity: { type: Number, required: true },
    kmReadingAtFueling: { type: Number, required: true },
    kmDoneSinceLastFueling: { type: Number, default: 0 },
    cost: { type: Number, required: true },
  },
  { timestamps: true }
);

export const FuelRecord: Model<IFuelRecordDocument> =
  mongoose.models.FuelRecord || mongoose.model<IFuelRecordDocument>('FuelRecord', FuelRecordSchema);

export default FuelRecord;
