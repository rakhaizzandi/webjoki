// filepath: src/app/api/admin/orders/route.ts
import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getAdminFromToken } from '@/lib/auth';

// GET all orders (admin)
export async function GET(request: Request) {
  try {
    const user = await getAdminFromToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }
    
    const rows = await sql`
      SELECT
        o.*,
        u.email,
        u.nickname AS user_nickname,
        o.id AS "_id",
        o.service_id AS "serviceId",
        o.package_id AS "packageId",
        o.user_id_ml AS "userIdML",
        o.server_id AS "serverId",
        o.payment_method AS "paymentMethod",
        o.created_at AS "createdAt",
        json_build_object('nickname', u.nickname, 'email', u.email) AS "userId"
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
    `;

    const orders = rows.map((order) => ({
      ...order,
      createdAt: order.createdAt ? new Date(order.createdAt).toISOString() : null,
    }));
    
    return NextResponse.json(orders);
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to load orders' }, { status: 400 });
  }
}

// PUT update order status (admin)
export async function PUT(request: Request) {
  try {
    const user = await getAdminFromToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }
    
    const { searchParams } = new URL(request.url);
    const body = await request.json();
    const id = body.id || searchParams.get('id');
    const { status } = body;

    if (!id) {
      return NextResponse.json({ error: 'Order ID required' }, { status: 400 });
    }
    
    const [updatedOrder] = await sql`
      UPDATE orders 
      SET status = ${status}
      WHERE id = ${id}
      RETURNING *
    `;
    
    if (!updatedOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    
    return NextResponse.json(updatedOrder);
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to update order' }, { status: 400 });
  }
}

// DELETE order (admin)
export async function DELETE(request: Request) {
  try {
    const user = await getAdminFromToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Order ID required' }, { status: 400 });
    }
    
    await sql`DELETE FROM orders WHERE id = ${id}`;
    
    return NextResponse.json({ message: 'Order deleted' });
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to delete order' }, { status: 400 });
  }
}
