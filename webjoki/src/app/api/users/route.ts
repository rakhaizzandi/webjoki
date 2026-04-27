// filepath: src/app/api/users/route.ts
import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getAdminFromToken } from '@/lib/auth';

// GET all users (admin)
export async function GET(request: Request) {
  try {
    const user = await getAdminFromToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }
    
    const rows = await sql`
      SELECT
        id,
        id AS "_id",
        email,
        nickname,
        role,
        created_at,
        created_at AS "createdAt"
      FROM users ORDER BY created_at DESC
    `;

    const users = rows.map((user) => ({
      ...user,
      createdAt: user.createdAt ? new Date(user.createdAt).toISOString() : null,
    }));
    
    return NextResponse.json(users);
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to load users' }, { status: 400 });
  }
}

// PUT update user (admin)
export async function PUT(request: Request) {
  try {
    const user = await getAdminFromToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }
    
    const body = await request.json();
    const { nickname, role } = body;
    
    const [updatedUser] = await sql`
      UPDATE users 
      SET nickname = COALESCE(${nickname}, nickname),
          role = COALESCE(${role}, role)
      WHERE id = ${id}
      RETURNING id, email, nickname, role, created_at
    `;
    
    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    return NextResponse.json(updatedUser);
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to update user' }, { status: 400 });
  }
}

// DELETE user (admin)
export async function DELETE(request: Request) {
  try {
    const user = await getAdminFromToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }
    
    await sql`DELETE FROM users WHERE id = ${id}`;
    
    return NextResponse.json({ message: 'User deleted' });
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to delete user' }, { status: 400 });
  }
}
