import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/lib/models';
import { hashPassword, signToken, COOKIE_NAME } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { fullName, email, password, phone, department, employeeId } = body;

    if (!fullName || !email || !password) {
      return NextResponse.json({ error: 'Please provide full name, email, and password.' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters long.' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 });
    }

    const hashedPassword = await hashPassword(password);
    const userCount = await User.countDocuments();
    // If it's the very first user registered, we can allow admin, or default to passenger
    const role = userCount === 0 ? 'admin' : 'passenger';

    const newUser = await User.create({
      fullName: fullName.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      phone: phone || '',
      department: department || '',
      employeeId: employeeId || '',
      role,
      isActive: true,
    });

    const token = await signToken({
      userId: newUser._id.toString(),
      email: newUser.email,
      fullName: newUser.fullName,
      role: newUser.role,
      department: newUser.department,
      employeeId: newUser.employeeId,
    });

    const response = NextResponse.json(
      {
        message: 'Account created successfully',
        user: {
          id: newUser._id,
          fullName: newUser.fullName,
          email: newUser.email,
          role: newUser.role,
        },
      },
      { status: 201 }
    );

    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
    });

    return response;
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
