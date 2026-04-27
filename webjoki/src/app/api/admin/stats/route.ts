// filepath: src/app/api/admin/stats/route.ts
import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getAdminFromToken } from '@/lib/auth';

// GET dashboard stats (admin)
export async function GET(request: Request) {
  try {
    const user = await getAdminFromToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }
    
    const users = await sql`SELECT * FROM users`;
    const orders = await sql`SELECT * FROM orders`;
    
    const totalUsers = users.length;
    const totalAdmins = users.filter((u: any) => u.role === 'admin').length;
    const totalOrders = orders.length;
    const pendingOrders = orders.filter((o: any) => o.status === 'pending').length;
    const processingOrders = orders.filter((o: any) => o.status === 'processing').length;
    const completedOrders = orders.filter((o: any) => o.status === 'completed').length;
    
    return NextResponse.json({
      totalUsers,
      totalAdmins,
      totalOrders,
      pendingOrders,
      processingOrders,
      completedOrders,
    });
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to load dashboard stats' }, { status: 400 });
  }
}
