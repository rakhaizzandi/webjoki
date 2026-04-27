import jwt from 'jsonwebtoken';
import { sql } from './db';

export type JwtPayload = {
  userId: number;
};

export function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET is missing. Set it in Vercel Environment Variables.');
  }

  return secret;
}

export function getTokenPayload(request: Request): JwtPayload | null {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, getJwtSecret());
    if (typeof decoded === 'string' || typeof decoded.userId !== 'number') {
      return null;
    }

    return { userId: decoded.userId };
  } catch {
    return null;
  }
}

export async function getAdminFromToken(request: Request) {
  const decoded = getTokenPayload(request);
  if (!decoded) return null;

  const [user] = await sql`
    SELECT id, role FROM users WHERE id = ${decoded.userId}
  `;

  if (!user || user.role !== 'admin') return null;
  return decoded;
}
