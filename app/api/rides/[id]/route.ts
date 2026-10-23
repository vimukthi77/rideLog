import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Ride, Vehicle } from '@/lib/models';
import { getServerSession } from '@/lib/auth';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const ride = await Ride.findById(params.id)
      .populate('vehicle', 'vehicleRegNo vehicleName vehicleType currentMeterReading initialMeterReading')
      .populate('driver', 'fullName phone email department employeeId')
      .populate('passenger', 'fullName phone email department employeeId')
      .lean();

    if (!ride) {
      return NextResponse.json({ error: 'Ride record not found' }, { status: 404 });
    }

    return NextResponse.json({ ride });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized: Please log in.' }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();
    const ride = await Ride.findById(params.id);

    if (!ride) {
      return NextResponse.json({ error: 'Ride record not found' }, { status: 404 });
    }

    // Check authorization: passenger of the ride, assigned driver, or admin
    const isPassenger = ride.passenger.toString() === session.userId;
    const isDriver = ride.driver.toString() === session.userId;
    const isAdmin = session.role === 'admin';

    if (!isPassenger && !isDriver && !isAdmin) {
      return NextResponse.json({ error: 'Unauthorized to modify this ride record.' }, { status: 403 });
    }

    const {
      endTime,
      endMileageKM,
      otHours,
      driverSignature,
      passengerSignature,
      placesVisited,
      tripPurpose,
      authorizingOfficer,
      status,
    } = body;

    // If completing the ride
    if (status === 'completed' || endMileageKM !== undefined) {
      if (!endTime) {
        return NextResponse.json({ error: 'End time is required to complete the ride.' }, { status: 400 });
      }

      const endKM = Number(endMileageKM);
      if (isNaN(endKM)) {
        return NextResponse.json({ error: 'Valid end mileage reading is required.' }, { status: 400 });
      }

      if (endKM < ride.startMileageKM) {
        return NextResponse.json(
          {
            error: `End mileage (${endKM} KM) cannot be less than start mileage (${ride.startMileageKM} KM).`,
          },
          { status: 400 }
        );
      }

      ride.endTime = endTime;
      ride.endMileageKM = endKM;
      ride.noOfKMDone = endKM - ride.startMileageKM;
      ride.status = 'completed';
      ride.otHours = otHours ? Number(otHours) : 0;
      if (driverSignature !== undefined) ride.driverSignature = Boolean(driverSignature);
      if (passengerSignature !== undefined) ride.passengerSignature = Boolean(passengerSignature);

      // Update vehicle's current meter reading
      await Vehicle.findByIdAndUpdate(ride.vehicle, {
        currentMeterReading: endKM,
      });
    }

    // Other edits (if admin or updating general fields)
    if (placesVisited) ride.placesVisited = placesVisited.trim();
    if (tripPurpose !== undefined) ride.tripPurpose = tripPurpose.trim();
    if (authorizingOfficer !== undefined) ride.authorizingOfficer = authorizingOfficer.trim();
    if (status === 'cancelled') ride.status = 'cancelled';

    await ride.save();

    const updated = await Ride.findById(ride._id)
      .populate('vehicle', 'vehicleRegNo vehicleName vehicleType currentMeterReading')
      .populate('driver', 'fullName phone email')
      .populate('passenger', 'fullName phone email');

    return NextResponse.json({ message: 'Ride updated successfully', ride: updated });
  } catch (error: any) {
    console.error('Update ride error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
