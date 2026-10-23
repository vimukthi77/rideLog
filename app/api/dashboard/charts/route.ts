import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Vehicle, Ride, User, Driver } from '@/lib/models';
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
    const daysInMonth = endOfMonth.getDate();

    // Fetch all active vehicles & drivers
    const [vehicles, drivers, monthlyRides] = await Promise.all([
      Vehicle.find({ isActive: true }).select('vehicleRegNo vehicleName vehicleType currentMeterReading').lean(),
      Driver.find({ isAvailable: true }).populate('userId', 'fullName').lean(),
      Ride.find({
        date: { $gte: startOfMonth, $lte: endOfMonth },
      })
        .populate('vehicle', 'vehicleRegNo vehicleName')
        .populate('driver', 'fullName')
        .lean(),
    ]);

    // 1. Vehicle KM Usage
    const vehicleMap = new Map<string, { name: string; regNo: string; km: number; trips: number }>();
    vehicles.forEach((v: any) => {
      vehicleMap.set(v._id.toString(), {
        name: v.vehicleName,
        regNo: v.vehicleRegNo,
        km: 0,
        trips: 0,
      });
    });

    // 2. Driver KM Usage
    const driverMap = new Map<string, { name: string; km: number; trips: number }>();
    drivers.forEach((d: any) => {
      const uId = d.userId?._id?.toString();
      if (uId) {
        driverMap.set(uId, {
          name: d.userId?.fullName || 'Driver',
          km: 0,
          trips: 0,
        });
      }
    });

    // 3. Daily Trend (1..daysInMonth)
    const dailyMap = new Map<number, { day: number; dateStr: string; rides: number; km: number }>();
    for (let day = 1; day <= daysInMonth; day++) {
      const dStr = `${day} ${now.toLocaleString('default', { month: 'short' })}`;
      dailyMap.set(day, { day, dateStr: dStr, rides: 0, km: 0 });
    }

    // Populate data from monthly rides
    monthlyRides.forEach((r: any) => {
      const vId = r.vehicle?._id?.toString();
      const dId = r.driver?._id?.toString();
      const km = Number(r.noOfKMDone) || 0;

      if (vId && vehicleMap.has(vId)) {
        const item = vehicleMap.get(vId)!;
        item.km += km;
        item.trips += 1;
      }

      if (dId && driverMap.has(dId)) {
        const item = driverMap.get(dId)!;
        item.km += km;
        item.trips += 1;
      }

      const rideDate = new Date(r.date);
      const dayNum = rideDate.getDate();
      if (dailyMap.has(dayNum)) {
        const dItem = dailyMap.get(dayNum)!;
        dItem.rides += 1;
        dItem.km += km;
      }
    });

    const vehicleKM = Array.from(vehicleMap.values()).map((item) => ({
      name: `${item.regNo} (${item.name})`,
      shortName: item.regNo,
      km: Math.round(item.km),
      trips: item.trips,
    }));

    const driverKM = Array.from(driverMap.values()).map((item) => ({
      name: item.name,
      km: Math.round(item.km),
      trips: item.trips,
    }));

    const dailyTrend = Array.from(dailyMap.values());

    // Pie chart for vehicle usage
    const totalMonthKM = vehicleKM.reduce((acc, v) => acc + v.km, 0);
    const vehiclePie = vehicleKM
      .filter((v) => v.km > 0)
      .map((v) => ({
        name: v.shortName,
        value: v.km,
        percent: totalMonthKM > 0 ? Math.round((v.km / totalMonthKM) * 100) : 0,
      }));

    // If all are 0, populate with placeholder equal distribution for preview
    const pieData = vehiclePie.length > 0 ? vehiclePie : vehicles.map((v: any) => ({
      name: v.vehicleRegNo,
      value: 1,
      percent: Math.round(100 / (vehicles.length || 1)),
    }));

    return NextResponse.json({
      vehicleKM,
      driverKM,
      dailyTrend,
      vehiclePie: pieData,
      totalMonthKM,
    });
  } catch (error: any) {
    console.error('Charts aggregation error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
