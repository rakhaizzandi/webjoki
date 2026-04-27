// filepath: src/app/api/auth/me/route.ts
import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getTokenPayload } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const verified = getTokenPayload(request);
    if (!verified) {
      return NextResponse.json({ error: 'Access denied' }, { status: 401 });
    }

    const [user] = await sql`
      SELECT id, email, nickname, role, created_at 
      FROM users WHERE id = ${verified.userId}
    `;
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    return NextResponse.json(user);
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
  }
}
