import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { AuthSession } from './types';

const JWT_SECRET = process.env.JWT_SECRET || 'lakdhanavi_super_secret_jwt_key_sahasdhanavi_350mw_lng';
const secretKey = new TextEncoder().encode(JWT_SECRET);
export const COOKIE_NAME = 'lakdhanavi_auth_token';

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(password, hashed);
}

export async function signToken(payload: AuthSession): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(secretKey);
}

export async function verifyToken(token: string): Promise<AuthSession | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return payload as unknown as AuthSession;
  } catch {
    return null;
  }
}

export async function getServerSession(): Promise<AuthSession | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return await verifyToken(token);
  } catch {
    return null;
  }
}
