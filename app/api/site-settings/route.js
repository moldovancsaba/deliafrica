import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import { DEFAULT_HERO_MODE, HERO_MODES } from '@/lib/hero-config';
import { getSiteSettings } from '@/lib/site-settings';
import { DEFAULT_SITE_SETTINGS } from '@/lib/site-config';
import SiteSetting from '@/models/SiteSetting';
import IntegrationSetting from '@/models/IntegrationSetting';

export const dynamic = 'force-dynamic';

function sanitizeCopy(value) {
  if (Array.isArray(value)) return value.slice(0, 30).map(sanitizeCopy);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [String(key).slice(0, 100), sanitizeCopy(item)]));
  return String(value ?? '').slice(0, 5000);
}

export async function GET() {
  const settings = await getSiteSettings();
  const mongo = await connectToDatabase();
  let stored = [];
  if (mongo.connected) stored = await IntegrationSetting.find({}).select('provider enabled credentials').lean();
  const configured = Object.fromEntries(stored.map((item) => [item.provider, Boolean(item.enabled && item.credentials && Object.keys(item.credentials).length)]));
  return NextResponse.json({ ...settings, defaultHeroMode: DEFAULT_HERO_MODE, providerReadiness: {
    packeta: configured.packeta || Boolean(process.env.PACKETA_API_KEY),
    barion: configured.barion || Boolean(process.env.BARION_POS_KEY),
    billingo: configured.billingo || Boolean(process.env.BILLINGO_API_KEY)
  } }, { headers: { 'cache-control': 'no-store' } });
}

export async function PUT(request) {
  const session = await getSession();
  if (!session || session.permission.status !== 'approved' || session.permission.role !== 'admin') return NextResponse.json({ error: 'Admin role required' }, { status: 403 });
  const body = await request.json();
  const updates = {};
  if (body.heroMode !== undefined) {
    if (!HERO_MODES.includes(body.heroMode)) return NextResponse.json({ error: 'Invalid hero mode' }, { status: 400 });
    updates.heroMode = body.heroMode;
  }
  if (body.categorySelectorMode !== undefined) {
    if (!['fixed', 'generated'].includes(body.categorySelectorMode)) return NextResponse.json({ error: 'Invalid category selector mode' }, { status: 400 });
    updates.categorySelectorMode = body.categorySelectorMode;
  }
  if (body.storefrontContent !== undefined) {
    if (!body.storefrontContent || typeof body.storefrontContent !== 'object') return NextResponse.json({ error: 'Invalid storefront content' }, { status: 400 });
    updates.storefrontContent = Object.fromEntries(Object.entries(DEFAULT_SITE_SETTINGS.storefrontContent).map(([key, fallback]) => [key, String(body.storefrontContent[key] ?? fallback).slice(0, 2000)]));
  }
  if (body.uiCopy !== undefined) {
    if (!body.uiCopy || typeof body.uiCopy !== 'object') return NextResponse.json({ error: 'Invalid UI copy' }, { status: 400 });
    updates.uiCopy = sanitizeCopy(body.uiCopy);
  }
  if (body.sales !== undefined) {
    if (!body.sales || typeof body.sales !== 'object') return NextResponse.json({ error: 'Invalid sales settings' }, { status: 400 });
    updates.sales = {
      checkoutEnabled: Boolean(body.sales.checkoutEnabled), fulfillmentProvider: 'packeta', paymentProvider: 'barion', invoicingProvider: 'billingo',
      senderName: String(body.sales.senderName || 'deli.africa').slice(0, 120), supportEmail: String(body.sales.supportEmail || '').slice(0, 200),
      termsUrl: String(body.sales.termsUrl || '').slice(0, 500), privacyUrl: String(body.sales.privacyUrl || '').slice(0, 500)
    };
  }
  if (Object.keys(updates).length === 0) return NextResponse.json({ error: 'No supported settings supplied' }, { status: 400 });
  const mongo = await connectToDatabase();
  if (!mongo.connected) return NextResponse.json({ error: 'MongoDB unavailable' }, { status: 503 });
  await Promise.all(Object.entries(updates).map(([key, value]) => SiteSetting.findOneAndUpdate({ key }, { value, updatedBy: session.user.email }, { upsert: true, runValidators: true })));
  return NextResponse.json({ ok: true, ...updates });
}
