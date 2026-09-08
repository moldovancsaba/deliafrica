import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { getSession } from '@/lib/auth';
import Order from '@/models/Order';
import { APP_VERSION } from '@/lib/version';

export const dynamic = 'force-dynamic';

export async function GET() {
  const startedAt = Date.now();
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.permission.status !== 'approved' || session.permission.role !== 'admin') return NextResponse.json({ error: 'Admin role required' }, { status: 403 });
  const mongo = await connectToDatabase();
  let orders = { available: false, total: 0, today: 0, open: 0, revenue: 0 };
  if (mongo.connected) {
    const startOfDay = new Date();
    startOfDay.setUTCHours(0, 0, 0, 0);

    // An order is open only while it still requires operational action.
    // Delivered, returned, cancelled, refunded and legacy fulfilled orders are closed.
    const openOrderFilter = {
      orderStatus: { $nin: ['cancelled', 'refunded'] },
      deliveryStatus: { $nin: ['delivered', 'returned'] },
      status: { $nin: ['cancelled', 'fulfilled'] }
    };

    const [total, today, open, revenue] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ createdAt: { $gte: startOfDay } }),
      Order.countDocuments(openOrderFilter),
      Order.aggregate([{ $match: { orderStatus: { $nin: ['cancelled', 'refunded'] }, status: { $ne: 'cancelled' } } }, { $group: { _id: null, value: { $sum: '$total' } } }])
    ]);
    orders = { available: true, total, today, open, revenue: revenue[0]?.value || 0 };
  }
  const memory = process.memoryUsage();

  return NextResponse.json({
    status: 'ok',
    mongo,
    users: {
      active: 0,
      tracking: 'not-enabled',
      state: 'No Active Users'
    },
    realtime: {
      transport: 'Socket.io',
      endpoint: '/api/socket-io',
      status: 'endpoint-ready'
    },
    authentication: {
      provider: 'DoneIsBetter SSO',
      configured: Boolean(process.env.SSO_CLIENT_ID && process.env.SSO_CLIENT_SECRET),
      callback: '/auth/callback',
      admin: { id: session.user.id, name: session.user.name, email: session.user.email }
    },
    orders,
    deployment: {
      version: APP_VERSION,
      commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || 'local',
      region: process.env.VERCEL_REGION || 'local',
      url: process.env.VERCEL_PROJECT_PRODUCTION_URL || 'localhost'
    },
    process: { uptimeSeconds: Math.round(process.uptime()), memoryMb: Math.round(memory.rss / 1024 / 1024), node: process.version },
    runtime: process.env.VERCEL ? 'Vercel' : 'Local',
    environment: process.env.VERCEL_ENV || process.env.NODE_ENV || 'development',
    latencyMs: Date.now() - startedAt,
    timestamp: new Date().toISOString()
  }, { headers: { 'cache-control': 'no-store, max-age=0' } });
}
