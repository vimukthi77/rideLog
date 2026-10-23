import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Driver, User, Ride } from '@/lib/models';
import { getServerSession, hashPassword } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const activeOnly = searchParams.get('activeOnly') === 'true';

    const drivers = await Driver.find()
      .populate('userId', 'fullName email phone department employeeId isActive')
      .populate('assignedVehicles', 'vehicleRegNo vehicleName vehicleType')
      .lean();

    // Also fetch current month stats for each driver
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const driverStats = await Ride.aggregate([
      {
        $match: {
          status: 'completed',
          date: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $group: {
          _id: '$driver',
          totalKM: { $sum: '$noOfKMDone' },
          totalTrips: { $sum: 1 },
        },
      },
    ]);

    const statsMap = new Map();
    driverStats.forEach((stat) => {
      statsMap.set(stat._id.toString(), {
        totalKM: stat.totalKM || 0,
        totalTrips: stat.totalTrips || 0,
      });
    });

    // Check ongoing rides to see who is currently on a trip
    const ongoingRides = await Ride.find({ status: 'ongoing' }).select('driver').lean();
    const busyDriverIds = new Set(ongoingRides.map((r: any) => r.driver?.toString()));

    const result = drivers
      .filter((d: any) => (activeOnly ? d.userId?.isActive !== false : true))
      .map((d: any) => {
        const uId = d.userId?._id?.toString();
        const stat = (uId && statsMap.get(uId)) || { totalKM: 0, totalTrips: 0 };
        return {
          ...d,
          isCurrentlyOnTrip: uId ? busyDriverIds.has(uId) : false,
          totalKMThisMonth: stat.totalKM,
          totalTripsThisMonth: stat.totalTrips,
        };
      });

    return NextResponse.json({ drivers: result });
  } catch (error: any) {
    console.error('Fetch drivers error:', error);
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
    const { userId, licenseNumber, licenseExpiry, assignedVehicles, newUserData } = body;

    let targetUserId = userId;

    // If adding a new user from scratch
    if (!targetUserId && newUserData) {
      const { fullName, email, password, phone, employeeId, department } = newUserData;
      if (!fullName || !email || !password) {
        return NextResponse.json({ error: 'Full name, email, and password are required for new driver user.' }, { status: 400 });
      }

      const existing = await User.findOne({ email: email.toLowerCase().trim() });
      if (existing) {
        return NextResponse.json({ error: 'User with this email already exists.' }, { status: 409 });
      }

      const hashedPassword = await hashPassword(password);
      const user = await User.create({
        fullName: fullName.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        phone: phone || '',
        department: department || 'Transport',
        employeeId: employeeId || '',
        role: 'driver',
        isActive: true,
      });
      targetUserId = user._id;
    }

    if (!targetUserId) {
      return NextResponse.json({ error: 'Please select an existing user or provide details for a new driver.' }, { status: 400 });
    }

    // Update user role to driver
    await User.findByIdAndUpdate(targetUserId, { role: 'driver', isActive: true });

    // Check if driver profile exists
    let driverProfile = await Driver.findOne({ userId: targetUserId });
    if (driverProfile) {
      driverProfile.licenseNumber = licenseNumber || driverProfile.licenseNumber;
      if (licenseExpiry) driverProfile.licenseExpiry = new Date(licenseExpiry);
      if (assignedVehicles) driverProfile.assignedVehicles = assignedVehicles;
      await driverProfile.save();
    } else {
      driverProfile = await Driver.create({
        userId: targetUserId,
        licenseNumber: licenseNumber || '',
        licenseExpiry: licenseExpiry ? new Date(licenseExpiry) : undefined,
        assignedVehicles: Array.isArray(assignedVehicles) ? assignedVehicles : [],
        isAvailable: true,
      });
    }

    return NextResponse.json({ message: 'Driver registered successfully', driver: driverProfile }, { status: 201 });
  } catch (error: any) {
    console.error('Create driver error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
