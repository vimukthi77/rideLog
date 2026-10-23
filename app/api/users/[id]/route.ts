import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/lib/models';
import { getServerSession, hashPassword } from '@/lib/auth';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const user = await User.findById(params.id).select('-password').lean();
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json({ user });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admin or the user themselves can update
    const isSelf = session.userId === params.id;
    const isAdmin = session.role === 'admin';

    if (!isSelf && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectDB();
    const body = await req.json();
    const user = await User.findById(params.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (body.fullName) user.fullName = body.fullName.trim();
    if (body.phone !== undefined) user.phone = body.phone;
    if (body.department !== undefined) user.department = body.department;
    if (body.employeeId !== undefined) user.employeeId = body.employeeId;
    if (body.profileImage !== undefined) user.profileImage = body.profileImage;

    // Only admin can change role or active status
    if (isAdmin) {
      if (body.role) user.role = body.role;
      if (body.isActive !== undefined) user.isActive = body.isActive;
    }

    // Password change
    if (body.password) {
      if (body.password.length < 6) {
        return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
      }
      user.password = await hashPassword(body.password);
    }

    await user.save();
    const updated = user.toObject();
    delete updated.password;

    return NextResponse.json({ message: 'User updated successfully', user: updated });
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

    if (session.userId === params.id) {
      return NextResponse.json({ error: 'Cannot deactivate your own admin account.' }, { status: 400 });
    }

    await connectDB();
    const user = await User.findByIdAndUpdate(params.id, { isActive: false }, { new: true });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'User deactivated successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
