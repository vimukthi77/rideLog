import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Vehicle, Ride } from '@/lib/models';
import { getServerSession } from '@/lib/auth';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const vehicle = await Vehicle.findById(params.id)
      .populate('assignedDrivers', 'fullName email phone')
      .lean();

    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }

    const recentRides = await Ride.find({ vehicle: vehicle._id })
      .populate('driver', 'fullName')
      .populate('passenger', 'fullName')
      .sort({ date: -1, createdAt: -1 })
      .limit(10)
      .lean();

    return NextResponse.json({ vehicle, recentRides });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized: Admin privileges required.' }, { status: 403 });
    }

    await connectDB();
    const body = await req.json();

    const vehicle = await Vehicle.findById(params.id);
    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }

    if (body.vehicleRegNo) {
      const cleanReg = body.vehicleRegNo.trim().toUpperCase();
      const existing = await Vehicle.findOne({ vehicleRegNo: cleanReg, _id: { $ne: params.id } });
      if (existing) {
        return NextResponse.json({ error: 'Vehicle with this registration number already exists.' }, { status: 409 });
      }
      vehicle.vehicleRegNo = cleanReg;
    }

    if (body.vehicleType !== undefined) vehicle.vehicleType = body.vehicleType;
    if (body.vehicleName !== undefined) vehicle.vehicleName = body.vehicleName;
    if (body.fuelType !== undefined) vehicle.fuelType = body.fuelType;
    if (body.vehicleImage !== undefined) vehicle.vehicleImage = body.vehicleImage;
    if (body.isActive !== undefined) vehicle.isActive = body.isActive;
    if (body.currentMeterReading !== undefined) vehicle.currentMeterReading = Number(body.currentMeterReading);
    if (Array.isArray(body.assignedDrivers)) vehicle.assignedDrivers = body.assignedDrivers;

    await vehicle.save();
    return NextResponse.json({ message: 'Vehicle updated successfully', vehicle });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized: Admin privileges required.' }, { status: 403 });
    }

    await connectDB();
    // Soft delete by deactivating
    const vehicle = await Vehicle.findByIdAndUpdate(params.id, { isActive: false }, { new: true });
    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Vehicle deactivated successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
