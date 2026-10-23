import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Driver, User, Ride } from '@/lib/models';
import { getServerSession } from '@/lib/auth';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const driver = await Driver.findById(params.id)
      .populate('userId', 'fullName email phone department employeeId isActive')
      .populate('assignedVehicles', 'vehicleRegNo vehicleName vehicleType')
      .lean();

    if (!driver) {
      return NextResponse.json({ error: 'Driver not found' }, { status: 404 });
    }

    const recentRides = await Ride.find({ driver: (driver as any).userId?._id })
      .populate('vehicle', 'vehicleRegNo vehicleName')
      .populate('passenger', 'fullName')
      .sort({ date: -1, createdAt: -1 })
      .limit(10)
      .lean();

    return NextResponse.json({ driver, recentRides });
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
    const driver = await Driver.findById(params.id);

    if (!driver) {
      return NextResponse.json({ error: 'Driver not found' }, { status: 404 });
    }

    if (body.licenseNumber !== undefined) driver.licenseNumber = body.licenseNumber;
    if (body.licenseExpiry !== undefined) driver.licenseExpiry = body.licenseExpiry ? new Date(body.licenseExpiry) : undefined;
    if (body.isAvailable !== undefined) driver.isAvailable = body.isAvailable;
    if (Array.isArray(body.assignedVehicles)) driver.assignedVehicles = body.assignedVehicles;

    await driver.save();

    if (body.fullName || body.phone || body.department || body.employeeId || body.isActive !== undefined) {
      const updateData: any = {};
      if (body.fullName) updateData.fullName = body.fullName;
      if (body.phone) updateData.phone = body.phone;
      if (body.department) updateData.department = body.department;
      if (body.employeeId) updateData.employeeId = body.employeeId;
      if (body.isActive !== undefined) updateData.isActive = body.isActive;

      await User.findByIdAndUpdate(driver.userId, updateData);
    }

    return NextResponse.json({ message: 'Driver updated successfully', driver });
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
    const driver = await Driver.findById(params.id);
    if (!driver) {
      return NextResponse.json({ error: 'Driver not found' }, { status: 404 });
    }

    // Set user inactive
    await User.findByIdAndUpdate(driver.userId, { isActive: false });
    driver.isAvailable = false;
    await driver.save();

    return NextResponse.json({ message: 'Driver deactivated successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
