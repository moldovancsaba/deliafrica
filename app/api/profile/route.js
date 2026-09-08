import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import User from '@/models/User';
import Order from '@/models/Order';

export const dynamic = 'force-dynamic';

function text(value, max = 300) {
  return String(value || '').trim().slice(0, max);
}

function cleanShipping(value = {}) {
  return {
    recipientName: text(value.recipientName),
    phone: text(value.phone, 80),
    country: text(value.country, 120) || 'Hungary',
    postalCode: text(value.postalCode, 30),
    city: text(value.city, 120),
    addressLine1: text(value.addressLine1, 300),
    addressLine2: text(value.addressLine2, 300),
    deliveryNote: text(value.deliveryNote, 600)
  };
}

function cleanBilling(value = {}) {
  return {
    billingName: text(value.billingName),
    companyName: text(value.companyName),
    taxNumber: text(value.taxNumber, 80),
    country: text(value.country, 120) || 'Hungary',
    postalCode: text(value.postalCode, 30),
    city: text(value.city, 120),
    addressLine1: text(value.addressLine1, 300),
    addressLine2: text(value.addressLine2, 300)
  };
}

async function currentUser() {
  const session = await getSession();
  if (!session) return { session: null, user: null };
  const db = await connectToDatabase();
  if (!db.connected) return { session, user: null, dbError: true };
  const user = await User.findOneAndUpdate(
    { ssoUserId: session.user.id },
    { $setOnInsert: { ssoUserId: session.user.id, firstLoginAt: new Date() }, $set: { email: session.user.email || '', name: session.user.name || '', lastSeenAt: new Date() } },
    { upsert: true, new: true }
  );
  return { session, user };
}

export async function GET() {
  const { session, user, dbError } = await currentUser();
  if (!session) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  if (dbError || !user) return NextResponse.json({ error: 'MongoDB unavailable' }, { status: 503 });
  const orders = await Order.find({ ssoUserId: session.user.id }).sort({ createdAt: -1 }).limit(50).lean();
  return NextResponse.json({
    profile: {
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      shippingAddress: user.shippingAddress || {},
      billingDetails: user.billingDetails || {},
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt
    },
    orders: orders.map(order => ({
      reference: order.reference,
      createdAt: order.createdAt,
      total: order.total,
      currency: order.currency,
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus,
      invoiceStatus: order.invoiceStatus,
      deliveryStatus: order.deliveryStatus,
      trackingUrl: order.trackingUrl || '',
      items: order.items || []
    }))
  }, { headers: { 'cache-control': 'no-store' } });
}

export async function PUT(request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  const db = await connectToDatabase();
  if (!db.connected) return NextResponse.json({ error: 'MongoDB unavailable' }, { status: 503 });

  const shippingAddress = cleanShipping(body.shippingAddress);
  const billingDetails = cleanBilling(body.billingDetails);
  const phone = text(body.phone, 80);

  const user = await User.findOneAndUpdate(
    { ssoUserId: session.user.id },
    {
      $setOnInsert: { ssoUserId: session.user.id, firstLoginAt: new Date() },
      $set: {
        email: session.user.email || '',
        name: session.user.name || '',
        phone,
        shippingAddress,
        billingDetails,
        lastSeenAt: new Date(),
        updatedBy: session.user.email || session.user.id
      }
    },
    { upsert: true, new: true, runValidators: true }
  );

  return NextResponse.json({ ok: true, profile: { phone: user.phone, shippingAddress: user.shippingAddress, billingDetails: user.billingDetails } });
}
