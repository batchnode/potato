import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { parse } from 'cookie';

const SECRET_KEY = new TextEncoder().encode('potato-secret-key-change-me-in-prod'); // In prod this should be in env vars

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

export async function createToken(payload: any): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(SECRET_KEY);
}

export async function verifyToken(token: string): Promise<any> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload;
  } catch (e) {
    return null;
  }
}

export function getCookie(request: Request, name: string): string | null {
  const cookieHeader = request.headers.get('Cookie');
  if (!cookieHeader) return null;
  const cookies = parse(cookieHeader);
  return cookies[name] || null;
}
