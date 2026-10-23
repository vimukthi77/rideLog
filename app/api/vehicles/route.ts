import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Vehicle, Ride } from '@/lib/models';
import { getServerSession } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const activeOnly = searchParams.get('activeOnly') === 'true';

    const filter: any = {};
    if (activeOnly) {
      filter.isActive = true;
    }

    const vehicles = await Vehicle.find(filter)
      .populate('assignedDrivers', 'fullName email phone')
      .sort({ createdAt: -1 })
      .lean();

    // Check ongoing rides for real-time availability indicator
    const ongoingRides = await Ride.find({ status: 'ongoing' }).select('vehicle').lean();
    const busyVehicleIds = new Set(ongoingRides.map((r: any) => r.vehicle?.toString()));

    const vehiclesWithStatus = vehicles.map((v: any) => ({
      ...v,
      isCurrentlyInUse: busyVehicleIds.has(v._id.toString()),
    }));

    return NextResponse.json({ vehicles: vehiclesWithStatus });
  } catch (error: any) {
    console.error('Fetch vehicles error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized: Admin privileges required.' }, { status: 403 });
    }

    await connectDB();
    const body = await req.json();
    const {
      vehicleRegNo,
      vehicleType,
      vehicleName,
      initialMeterReading,
      fuelType,
      vehicleImage,
      assignedDrivers,
    } = body;

    if (!vehicleRegNo || !vehicleType || !vehicleName || initialMeterReading === undefined) {
      return NextResponse.json(
        { error: 'Vehicle registration number, type, name, and initial meter reading are required.' },
        { status: 400 }
      );
    }

    const cleanRegNo = vehicleRegNo.trim().toUpperCase();
    const existing = await Vehicle.findOne({ vehicleRegNo: cleanRegNo });
    if (existing) {
      return NextResponse.json({ error: `Vehicle with Reg No '${cleanRegNo}' already exists.` }, { status: 409 });
    }

    const meterNum = Number(initialMeterReading);
    if (isNaN(meterNum) || meterNum < 0) {
      return NextResponse.json({ error: 'Initial meter reading must be a valid non-negative number.' }, { status: 400 });
    }

    const newVehicle = await Vehicle.create({
      vehicleRegNo: cleanRegNo,
      vehicleType,
      vehicleName: vehicleName.trim(),
      initialMeterReading: meterNum,
      currentMeterReading: meterNum,
      fuelType: fuelType || 'Diesel',
      vehicleImage: vehicleImage || '',
      assignedDrivers: Array.isArray(assignedDrivers) ? assignedDrivers : [],
      isActive: true,
    });

    return NextResponse.json({ message: 'Vehicle added successfully', vehicle: newVehicle }, { status: 201 });
  } catch (error: any) {
    console.error('Create vehicle error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
