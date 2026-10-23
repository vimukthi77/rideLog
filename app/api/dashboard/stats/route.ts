import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Vehicle, Driver, Ride, User } from '@/lib/models';
import { getServerSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const startOfMonth = new Date(currentYear, currentMonth, 1);
    const endOfMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999);

    const [
      totalVehicles,
      activeDrivers,
      monthlyRides,
      ongoingRidesCount,
      totalUsers,
    ] = await Promise.all([
      Vehicle.countDocuments({ isActive: true }),
      Driver.countDocuments({ isAvailable: true }),
      Ride.find({
        date: { $gte: startOfMonth, $lte: endOfMonth },
      }).select('noOfKMDone status date').lean(),
      Ride.countDocuments({ status: 'ongoing' }),
      User.countDocuments({ isActive: true }),
    ]);

    const totalKMThisMonth = monthlyRides.reduce(
      (sum, r: any) => sum + (r.noOfKMDone || 0),
      0
    );
    const ridesCountThisMonth = monthlyRides.length;
    const completedRidesThisMonth = monthlyRides.filter((r: any) => r.status === 'completed').length;

    const monthName = now.toLocaleString('default', { month: 'long', year: 'numeric' });

    return NextResponse.json({
      stats: {
        totalVehicles,
        activeDrivers,
        totalKMThisMonth,
        ridesCountThisMonth,
        completedRidesThisMonth,
        ongoingRidesCount,
        totalUsers,
        currentMonth: monthName,
      },
    });
  } catch (error: any) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
