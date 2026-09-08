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

export async function GET(_request, { params }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Admin role required' }, { status: 403 });
  const db = await connectToDatabase();
  if (!db.connected) return NextResponse.json({ error: 'MongoDB unavailable' }, { status: 503 });

  const { ssoUserId } = await params;
  const decodedId = decodeURIComponent(ssoUserId);
  const user = await User.findOne({ ssoUserId: decodedId }).lean();
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const orders = await Order.find({ ssoUserId: decodedId }).sort({ createdAt: -1 }).lean();
  const totalSpent = orders.reduce((sum, order) => sum + (Number(order.total) || 0), 0);
  const paidOrders = orders.filter(order => order.paymentStatus === 'paid').length;
  const deliveredOrders = orders.filter(order => order.deliveryStatus === 'delivered').length;
  const cancelledOrders = orders.filter(order => order.orderStatus === 'cancelled').length;
  const latest = orders[0] || null;

  const addresses = [...new Set(orders.flatMap(order => [order.address, order.billingAddress]).filter(Boolean))];
  const phones = [...new Set(orders.map(order => order.phone).filter(Boolean))];
  const taxNumbers = [...new Set(orders.map(order => order.taxNumber).filter(Boolean))];

  return NextResponse.json({
    user: {
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
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      isCurrentUser: user.ssoUserId === session.user.id
    },
    summary: {
      orderCount: orders.length,
      totalSpent,
      paidOrders,
      deliveredOrders,
      cancelledOrders,
      averageOrderValue: orders.length ? Math.round(totalSpent / orders.length) : 0,
      firstOrderAt: orders.length ? orders.at(-1).createdAt : null,
      lastOrderAt: latest?.createdAt || null
    },
    profile: { addresses, phones, taxNumbers },
    orders: orders.map(order => ({
      reference: order.reference,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      items: order.items,
      subtotal: order.subtotal,
      shippingFee: order.shippingFee,
      discountTotal: order.discountTotal,
      total: order.total,
      currency: order.currency,
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus,
      invoiceStatus: order.invoiceStatus,
      fulfilmentStatus: order.fulfilmentStatus,
      deliveryStatus: order.deliveryStatus,
      paymentTransactionId: order.paymentTransactionId,
      paidAt: order.paidAt,
      invoiceNumber: order.invoiceNumber,
      invoiceUrl: order.invoiceUrl,
      invoicedAt: order.invoicedAt,
      packetaPointId: order.packetaPointId,
      parcelId: order.parcelId,
      trackingNumber: order.trackingNumber,
      trackingUrl: order.trackingUrl,
      readyAt: order.readyAt,
      handedOverAt: order.handedOverAt,
      deliveredAt: order.deliveredAt,
      customerName: order.customerName,
      email: order.email,
      phone: order.phone,
      address: order.address,
      billingName: order.billingName,
      billingAddress: order.billingAddress,
      taxNumber: order.taxNumber,
      customerNote: order.customerNote,
      adminNote: order.adminNote,
      statusHistory: order.statusHistory || []
    }))
  }, { headers: { 'cache-control': 'no-store' } });
}
