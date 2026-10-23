import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Ride } from '@/lib/models';
import { getServerSession } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized: Please log in.' }, { status: 401 });
    }

    await connectDB();
    const { searchParams } = new URL(req.url);
    const scope = searchParams.get('scope') || 'my'; // 'my' or 'all'
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');
    const status = searchParams.get('status');

    const filter: any = {};

    if (scope === 'my') {
      filter.$or = [{ passenger: session.userId }, { driver: session.userId }];
    }

    if (status && status !== 'all') {
      filter.status = status;
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
      .populate('driver', 'fullName phone')
      .populate('passenger', 'fullName phone')
      .sort({ date: -1, createdAt: -1 })
      .lean();

    // Summary calculations for the filtered set
    const totalKM = rides.reduce((acc, r: any) => acc + (r.noOfKMDone || 0), 0);
    const completedCount = rides.filter((r: any) => r.status === 'completed').length;
    const ongoingCount = rides.filter((r: any) => r.status === 'ongoing').length;

    return NextResponse.json({
      rides,
      summary: {
        totalRides: rides.length,
        totalKM,
        completedCount,
        ongoingCount,
      },
    });
  } catch (error: any) {
    console.error('Fetch my-rides error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
