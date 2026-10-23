import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'lakdhanavi_super_secret_jwt_key_sahasdhanavi_350mw_lng';
const secretKey = new TextEncoder().encode(JWT_SECRET);
const COOKIE_NAME = 'lakdhanavi_auth_token';

interface SessionPayload {
  userId: string;
  email: string;
  fullName: string;
  role: 'admin' | 'passenger' | 'driver';
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(COOKIE_NAME)?.value;

  let session: SessionPayload | null = null;
  if (token) {
    try {
      const { payload } = await jwtVerify(token, secretKey);
      session = payload as unknown as SessionPayload;
    } catch {
      session = null;
    }
  }

  const isAuthPage = pathname === '/login' || pathname === '/register';
  const isDashboardPage = pathname.startsWith('/dashboard');

  // If already logged in and visiting login/register, redirect to appropriate dashboard
  if (isAuthPage && session) {
    const target = session.role === 'admin' ? '/dashboard/admin' : '/dashboard/user';
    return NextResponse.redirect(new URL(target, request.url));
  }

  // If accessing dashboard and NOT logged in, redirect to login
  if (isDashboardPage && !session) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Role-based protection for /dashboard/admin
  if (pathname.startsWith('/dashboard/admin') && session && session.role !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard/user', request.url));
  }

  // Root /dashboard redirect based on role
  if (pathname === '/dashboard' && session) {
    const target = session.role === 'admin' ? '/dashboard/admin' : '/dashboard/user';
    return NextResponse.redirect(new URL(target, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/login',
    '/register',
  ],
};
