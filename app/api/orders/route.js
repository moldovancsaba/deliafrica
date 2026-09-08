import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Order from '@/models/Order';
import User from '@/models/User';
import { products } from '@/lib/products';
import { getSession, isAuthConfigured } from '@/lib/auth';
import { getSiteSettings } from '@/lib/site-settings';

export const dynamic = 'force-dynamic';

function fail(message, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

function addressString(address = {}) {
  return [address.postalCode, address.city, address.addressLine1, address.addressLine2, address.country].map(value => String(value || '').trim()).filter(Boolean).join(', ');
}

export async function POST(request) {
  const settings = await getSiteSettings();
  if (!settings.sales.checkoutEnabled) return fail('A rendelésfelvétel átmenetileg szünetel.', 503);
  const session = await getSession();
  const authConfigured = isAuthConfigured();
  if (authConfigured && !session) return fail('A rendeléshez bejelentkezés szükséges.', 401);
  if (authConfigured && session.permission.status !== 'approved') return fail('Az alkalmazás-hozzáférés nincs jóváhagyva.', 403);
  const body = await request.json().catch(() => null);
  if (!body) return fail('Érvénytelen rendelési adatok.');

  const db = await connectToDatabase();
  const profile = db.connected && session?.user.id ? await User.findOne({ ssoUserId: session.user.id }).lean() : null;

  const customerName = String(session?.user.name || body.customerName || '').trim();
  const email = String(session?.user.email || body.email || '').trim();
  const profileShipping = addressString(profile?.shippingAddress);
  const address = String(body.address || profileShipping || '').trim();
  const phone = String(body.phone || profile?.shippingAddress?.phone || profile?.phone || '').trim();
  const billingName = String(profile?.billingDetails?.billingName || profile?.billingDetails?.companyName || customerName).trim();
  const billingAddress = addressString(profile?.billingDetails) || address;
  const taxNumber = String(profile?.billingDetails?.taxNumber || '').trim();

  if (!customerName || !email.includes('@') || !address) {
    return fail('Név, érvényes e-mail és szállítási cím szükséges.');
  }
  if (!Array.isArray(body.items) || body.items.length === 0) {
    return fail('A kosár üres.');
  }

  const catalogue = new Map(products.map((p) => [p.id, p]));
  const items = [];
  let total = 0;

  for (const row of body.items) {
    const product = catalogue.get(row.productId);
    const quantity = Math.max(1, Math.min(20, Number(row.quantity) || 1));
    if (!product || product.price == null) return fail('A termék jelenleg nem rendelhető.');
    items.push({ productId: product.id, name: product.name, quantity, unitPrice: product.price });
    total += product.price * quantity;
  }

  const reference = `DA-${Date.now().toString(36).toUpperCase()}`;

  if (db.connected) {
    await Order.create({
      reference,
      ssoUserId: session?.user.id || '',
      customerName,
      email,
      phone,
      address,
      billingName,
      billingAddress,
      taxNumber,
      items,
      total
    });
  }

  return NextResponse.json({
    ok: true,
    reference,
    total,
    persisted: db.connected,
    message: db.connected
      ? 'Rendelés mentve.'
      : 'Rendelés fogadva demó módban; MongoDB nincs konfigurálva.'
  });
}
