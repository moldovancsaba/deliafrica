import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import Order from '@/models/Order';

export const dynamic = 'force-dynamic';

const allowed = {
  orderStatus: ['created','bought','cancelled','refunded'],
  paymentStatus: ['not_started','pending','paid','failed','refunded'],
  invoiceStatus: ['not_started','pending','invoiced','failed','storno'],
  fulfilmentStatus: ['not_ready','picking','ready_to_deliver','handed_over'],
  deliveryStatus: ['not_started','label_created','in_transit','delivered','failed','returned']
};

async function admin() {
  const session = await getSession();
  return session && session.permission.status === 'approved' && session.permission.role === 'admin' ? session : null;
}

export async function GET(request) {
  const session = await admin();
  if (!session) return NextResponse.json({ error:'Admin role required' }, { status:403 });
  const db = await connectToDatabase();
  if (!db.connected) return NextResponse.json({ error:'MongoDB unavailable' }, { status:503 });
  const url = new URL(request.url);
  const limit = Math.min(200, Math.max(1, Number(url.searchParams.get('limit')) || 100));
  const orders = await Order.find({}).sort({ createdAt:-1 }).limit(limit).lean();
  return NextResponse.json({ orders }, { headers:{'cache-control':'no-store'} });
}

export async function PUT(request) {
  const session = await admin();
  if (!session) return NextResponse.json({ error:'Admin role required' }, { status:403 });
  const body = await request.json().catch(() => null);
  if (!body?.reference) return NextResponse.json({ error:'Order reference required' }, { status:400 });
  const db = await connectToDatabase();
  if (!db.connected) return NextResponse.json({ error:'MongoDB unavailable' }, { status:503 });
  const order = await Order.findOne({ reference:body.reference });
  if (!order) return NextResponse.json({ error:'Order not found' }, { status:404 });

  const history = [];
  for (const [field, values] of Object.entries(allowed)) {
    if (body[field] === undefined) continue;
    if (!values.includes(body[field])) return NextResponse.json({ error:`Invalid ${field}` }, { status:400 });
    const before = order[field] || '';
    if (before !== body[field]) {
      history.push({ field, from:before, to:body[field], changedBy:session.user.email, note:String(body.statusNote || '').slice(0,500) });
      order[field] = body[field];
    }
  }

  const textFields = ['paymentTransactionId','invoiceNumber','invoiceUrl','packetaPointId','parcelId','trackingNumber','trackingUrl','adminNote','billingName','billingAddress','taxNumber'];
  for (const field of textFields) if (body[field] !== undefined) order[field] = String(body[field] || '').slice(0,1000);
  if (body.shippingFee !== undefined) order.shippingFee = Math.max(0, Number(body.shippingFee) || 0);
  if (body.discountTotal !== undefined) order.discountTotal = Math.max(0, Number(body.discountTotal) || 0);

  if (body.paymentStatus === 'paid' && !order.paidAt) order.paidAt = new Date();
  if (body.invoiceStatus === 'invoiced' && !order.invoicedAt) order.invoicedAt = new Date();
  if (body.fulfilmentStatus === 'ready_to_deliver' && !order.readyAt) order.readyAt = new Date();
  if (body.fulfilmentStatus === 'handed_over' && !order.handedOverAt) order.handedOverAt = new Date();
  if (body.deliveryStatus === 'delivered' && !order.deliveredAt) order.deliveredAt = new Date();
  if (history.length) order.statusHistory.push(...history);

  await order.save();
  return NextResponse.json({ ok:true, order });
}
