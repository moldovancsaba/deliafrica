import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import User from '@/models/User';
import Order from '@/models/Order';

export const dynamic = 'force-dynamic';

async function requireAdmin() {
  const session = await getSession();
  return session && session.permission.status === 'approved' && session.permission.role === 'admin' ? session : null;
}

async function backfillOrderUsers() {
  const rows = await Order.aggregate([
    { $match: { ssoUserId: { $type: 'string', $ne: '' } } },
    { $sort: { createdAt: 1 } },
    { $group: { _id: '$ssoUserId', email: { $last: '$email' }, name: { $last: '$customerName' }, firstOrderAt: { $first: '$createdAt' }, lastOrderAt: { $last: '$createdAt' }, orderCount: { $sum: 1 } } }
  ]);
  for (const row of rows) {
    await User.findOneAndUpdate(
      { ssoUserId: row._id },
      {
        $setOnInsert: { firstLoginAt: row.firstOrderAt || new Date(), lastLoginAt: row.lastOrderAt || new Date() },
        $set: { email: row.email || '', name: row.name || row.email || 'Vásárló', lastSeenAt: row.lastOrderAt || new Date() }
      },
      { upsert: true, setDefaultsOnInsert: true }
    );
  }
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Admin role required' }, { status: 403 });
  const db = await connectToDatabase();
  if (!db.connected) return NextResponse.json({ error: 'MongoDB unavailable' }, { status: 503 });
  await backfillOrderUsers();
  const users = await User.find({}).sort({ lastSeenAt: -1, createdAt: -1 }).lean();
  const orderStats = await Order.aggregate([
    { $match: { ssoUserId: { $type: 'string', $ne: '' } } },
    { $group: { _id: '$ssoUserId', orderCount: { $sum: 1 }, totalSpent: { $sum: '$total' }, lastOrderAt: { $max: '$createdAt' } } }
  ]);
  const stats = new Map(orderStats.map(row => [row._id, row]));
  return NextResponse.json({
    users: users.map(user => {
      const stat = stats.get(user.ssoUserId) || {};
      return {
        id: String(user._id),
        ssoUserId: user.ssoUserId,
        email: user.email,
        name: user.name,
        role: user.roleOverride || user.ssoRole || 'user',
        roleOverride: user.roleOverride || '',
        ssoRole: user.ssoRole || 'user',
        ssoStatus: user.ssoStatus || 'unknown',
        active: user.active !== false,
        firstLoginAt: user.firstLoginAt,
        lastLoginAt: user.lastLoginAt,
        lastSeenAt: user.lastSeenAt,
        orderCount: stat.orderCount || 0,
        totalSpent: stat.totalSpent || 0,
        lastOrderAt: stat.lastOrderAt || null,
        isCurrentUser: user.ssoUserId === session.user.id
      };
    })
  }, { headers: { 'cache-control': 'no-store' } });
}

export async function PATCH(request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Admin role required' }, { status: 403 });
  const body = await request.json().catch(() => null);
  if (!body?.ssoUserId || !['user','admin'].includes(body.role)) return NextResponse.json({ error: 'Valid user and role are required' }, { status: 400 });
  if (body.ssoUserId === session.user.id && body.role !== 'admin') return NextResponse.json({ error: 'You cannot remove your own admin access.' }, { status: 400 });
  const db = await connectToDatabase();
  if (!db.connected) return NextResponse.json({ error: 'MongoDB unavailable' }, { status: 503 });
  const user = await User.findOneAndUpdate(
    { ssoUserId: String(body.ssoUserId) },
    { $set: { roleOverride: body.role, updatedBy: session.user.email, active: true } },
    { new: true, runValidators: true }
  ).lean();
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  return NextResponse.json({ ok: true, user: { ssoUserId: user.ssoUserId, role: user.roleOverride || user.ssoRole || 'user' } });
}
