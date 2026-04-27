// filepath: src/app/api/orders/route.ts
import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getTokenPayload } from '@/lib/auth';

// GET all orders (for current user)
export async function GET(request: Request) {
  try {
    const user = getTokenPayload(request);
    if (!user) {
      return NextResponse.json({ error: 'Access denied' }, { status: 401 });
    }
    
    const orders = await sql`
      SELECT * FROM orders WHERE user_id = ${user.userId}
      ORDER BY created_at DESC
    `;
    
    return NextResponse.json(orders);
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to load orders' }, { status: 400 });
  }
}

// POST create new order
export async function POST(request: Request) {
  try {
    const user = getTokenPayload(request);
    if (!user) {
      return NextResponse.json({ error: 'Access denied' }, { status: 401 });
    }
    
    const body = await request.json();
    const { serviceId, packageId, nickname, userIdML, serverId, notes, paymentMethod } = body;
    
    const [order] = await sql`
      INSERT INTO orders (user_id, service_id, package_id, nickname, user_id_ml, server_id, notes, payment_method, status)
      VALUES (${user.userId}, ${serviceId}, ${packageId}, ${nickname}, ${userIdML}, ${serverId}, ${notes}, ${paymentMethod}, 'pending')
      RETURNING *
    `;
    
    return NextResponse.json(order, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to create order' }, { status: 400 });
  }
}
