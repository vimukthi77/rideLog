import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/lib/models';

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    await connectDB();
    const user = await User.findById(session.userId).select('-password');
    if (!user || !user.isActive) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    return NextResponse.json({
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        department: user.department,
        employeeId: user.employeeId,
        profileImage: user.profileImage,
        createdAt: user.createdAt,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
