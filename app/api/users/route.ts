import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/lib/models';
import { getServerSession, hashPassword } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const role = searchParams.get('role');
    const activeOnly = searchParams.get('activeOnly') === 'true';

    const filter: any = {};
    if (role) filter.role = role;
    if (activeOnly) filter.isActive = true;

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ users });
  } catch (error: any) {
    console.error('Fetch users error:', error);
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
    const { fullName, email, password, phone, role, department, employeeId } = body;

    if (!fullName || !email || !password) {
      return NextResponse.json({ error: 'Full name, email, and password are required.' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      return NextResponse.json({ error: 'User with this email already exists.' }, { status: 409 });
    }

    const hashedPassword = await hashPassword(password);
    const user = await User.create({
      fullName: fullName.trim(),
      email: cleanEmail,
      password: hashedPassword,
      phone: phone || '',
      role: role || 'passenger',
      department: department || '',
      employeeId: employeeId || '',
      isActive: true,
    });

    const userObj = user.toObject();
    delete userObj.password;

    return NextResponse.json({ message: 'User created successfully', user: userObj }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
