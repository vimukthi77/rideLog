import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Ride, Vehicle } from '@/lib/models';
import { getServerSession } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const session = await getServerSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized: Admin privileges required.' }, { status: 403 });
    }

    await connectDB();
    const { searchParams } = new URL(req.url);
    const vehicleId = searchParams.get('vehicleId');
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');

    const filter: any = {};
    let vehicle = null;

    if (vehicleId) {
      filter.vehicle = vehicleId;
      vehicle = await Vehicle.findById(vehicleId).lean();
    }

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

    const rides = await Ride.find(filter)
      .populate('vehicle', 'vehicleRegNo vehicleName vehicleType currentMeterReading')
      .populate('driver', 'fullName phone employeeId')
      .populate('passenger', 'fullName phone employeeId department')
      .sort({ date: 1, startTime: 1, createdAt: 1 })
      .lean();

    const totalKMDone = rides.reduce((sum, r: any) => sum + (r.noOfKMDone || 0), 0);
    const totalTrips = rides.length;
    const completedTrips = rides.filter((r: any) => r.status === 'completed').length;

    // Find latest meter reading from the rides or vehicle current
    let lastMeterReading = vehicle ? (vehicle as any).currentMeterReading : 0;
    const completedRides = rides.filter((r: any) => typeof r.endMileageKM === 'number');
    if (completedRides.length > 0) {
      lastMeterReading = completedRides[completedRides.length - 1].endMileageKM;
    }

    return NextResponse.json({
      vehicle,
      rides,
      summary: {
        totalKMDone,
        totalTrips,
        completedTrips,
        lastMeterReading,
        fromDate: fromDate || null,
        toDate: toDate || null,
      },
    });
  } catch (error: any) {
    console.error('Report data error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
