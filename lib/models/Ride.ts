import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRideDocument extends Document {
  date: Date;
  vehicle: mongoose.Types.ObjectId;
  driver: mongoose.Types.ObjectId;
  passenger: mongoose.Types.ObjectId;
  authorizingOfficer?: string;
  startTime: string;
  endTime?: string;
  startMileageKM: number;
  endMileageKM?: number;
  noOfKMDone?: number;
  placesVisited: string;
  tripPurpose?: string;
  status: 'ongoing' | 'completed' | 'cancelled';
  driverSignature: boolean;
  passengerSignature: boolean;
  otHours: number;
  createdAt: Date;
  updatedAt: Date;
}

const RideSchema = new Schema<IRideDocument>(
  {
    date: { type: Date, default: () => new Date() },
    vehicle: { type: Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    driver: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    passenger: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    authorizingOfficer: { type: String, default: '' },
    startTime: { type: String, required: true },
    endTime: { type: String, default: '' },
    startMileageKM: { type: Number, required: true },
    endMileageKM: { type: Number },
    noOfKMDone: { type: Number, default: 0 },
    placesVisited: { type: String, required: true },
    tripPurpose: { type: String, default: '' },
    status: {
      type: String,
      enum: ['ongoing', 'completed', 'cancelled'],
      default: 'ongoing',
    },
    driverSignature: { type: Boolean, default: false },
    passengerSignature: { type: Boolean, default: false },
    otHours: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Auto-calculate noOfKMDone before save if endMileageKM is present
RideSchema.pre('save', function (next) {
  if (typeof this.endMileageKM === 'number' && typeof this.startMileageKM === 'number') {
    this.noOfKMDone = Math.max(0, this.endMileageKM - this.startMileageKM);
  }
  next();
});

export const Ride: Model<IRideDocument> =
  mongoose.models.Ride || mongoose.model<IRideDocument>('Ride', RideSchema);

export default Ride;
