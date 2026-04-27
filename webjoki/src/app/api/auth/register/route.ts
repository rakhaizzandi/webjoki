// filepath: src/app/api/auth/register/route.ts
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { sql } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { email, password, nickname } = await request.json();
    
    // Check if user already exists
    const [existingUser] = await sql`
      SELECT * FROM users WHERE email = ${email}
    `;
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }
    
    // Set role to 'admin' if email is admin@example.com (for demo)
    const role = email === 'admin@example.com' ? 'admin' : 'user';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const [newUser] = await sql`
      INSERT INTO users (email, password, nickname, role)
      VALUES (${email}, ${hashedPassword}, ${nickname}, ${role})
      RETURNING id, email, nickname, role, created_at
    `;
    
    return NextResponse.json(
      { message: 'User registered successfully', user: newUser },
      { status: 201 }
    );
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Registration failed' },
      { status: 400 }
    );
  }
}
