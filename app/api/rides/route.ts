import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Ride, Vehicle, User } from '@/lib/models';
import { getServerSession } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const vehicleId = searchParams.get('vehicleId');
    const driverId = searchParams.get('driverId');
    const passengerId = searchParams.get('passengerId');
    const status = searchParams.get('status');
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const filter: any = {};

    if (vehicleId) filter.vehicle = vehicleId;
    if (driverId) filter.driver = driverId;
    if (passengerId) filter.passenger = passengerId;
    if (status) filter.status = status;

    if (fromDate || toDate) {
      filter.date = {};
      if (fromDate) {
        const start = new Date(fromDate);
        start.setHours(0, 0, 0, 0);
        filter.date.$gte = start;
      }
      if (toDate) {
        const end = new Date(toDate);
        end.setHours(23, 59, 59, 999);
        filter.date.$lte = end;
      }
    }

    if (search) {
      filter.$or = [
        { placesVisited: { $regex: search, $options: 'i' } },
        { tripPurpose: { $regex: search, $options: 'i' } },
        { authorizingOfficer: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [rides, total] = await Promise.all([
      Ride.find(filter)
        .populate('vehicle', 'vehicleRegNo vehicleName vehicleType currentMeterReading')
        .populate('driver', 'fullName phone employeeId department')
        .populate('passenger', 'fullName phone employeeId department')
        .sort({ date: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Ride.countDocuments(filter),
    ]);

    return NextResponse.json({
      rides,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error: any) {
    console.error('Fetch rides error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Please log in to start a ride record.' }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();
    const {
      vehicleId,
      driverId,
      authorizingOfficer,
      startTime,
      startMileageKM,
      placesVisited,
      tripPurpose,
    } = body;

    if (!vehicleId || !driverId || !startTime || startMileageKM === undefined || !placesVisited) {
      return NextResponse.json(
        { error: 'Please fill in all required fields (Vehicle, Driver, Start Time, Start Mileage, and Places Visited).' },
        { status: 400 }
      );
    }

    // Verify vehicle exists and is active
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle || !vehicle.isActive) {
      return NextResponse.json({ error: 'Selected vehicle is not available or inactive.' }, { status: 400 });
    }

    // Check concurrent usage: prevent double-booking if vehicle currently has an ongoing ride
    const ongoingRideForVehicle = await Ride.findOne({
      vehicle: vehicleId,
      status: 'ongoing',
    }).populate('passenger', 'fullName');

    if (ongoingRideForVehicle) {
      const ongoingUser = (ongoingRideForVehicle as any).passenger?.fullName || 'another passenger';
      return NextResponse.json(
        {
          error: `Vehicle ${vehicle.vehicleRegNo} is already in use by ${ongoingUser}. Please select another vehicle or wait for the trip to complete.`,
        },
        { status: 409 }
      );
    }

    const startKM = Number(startMileageKM);
    if (isNaN(startKM) || startKM < 0) {
      return NextResponse.json({ error: 'Start mileage must be a valid positive number.' }, { status: 400 });
    }

    // Create ongoing ride
    const newRide = await Ride.create({
      date: new Date(),
      vehicle: vehicleId,
      driver: driverId,
      passenger: session.userId,
      authorizingOfficer: authorizingOfficer ? authorizingOfficer.trim() : '',
      startTime: startTime.trim(),
      startMileageKM: startKM,
      placesVisited: placesVisited.trim(),
      tripPurpose: tripPurpose ? tripPurpose.trim() : '',
      status: 'ongoing',
      passengerSignature: true, // Auto-signed by initiating passenger
    });

    const populated = await Ride.findById(newRide._id)
      .populate('vehicle', 'vehicleRegNo vehicleName vehicleType')
      .populate('driver', 'fullName phone')
      .populate('passenger', 'fullName phone');

    return NextResponse.json(
      { message: 'Ride started successfully', ride: populated },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create ride error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
