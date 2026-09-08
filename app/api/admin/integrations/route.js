import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import { encryptSecret } from '@/lib/secret-store';
import IntegrationSetting from '@/models/IntegrationSetting';

export const dynamic = 'force-dynamic';

const PROVIDERS = {
  packeta: { secretFields: ['apiKey', 'apiPassword'], publicFields: ['senderId', 'country', 'language'] },
  barion: { secretFields: ['posKey'], publicFields: ['payee', 'currency'] },
  billingo: { secretFields: ['apiKey'], publicFields: ['blockId', 'bankAccountId'] }
};

async function requireAdmin() {
  const session = await getSession();
  return session && session.permission.status === 'approved' && session.permission.role === 'admin' ? session : null;
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Admin role required' }, { status: 403 });
  const mongo = await connectToDatabase();
  if (!mongo.connected) return NextResponse.json({ error: 'MongoDB unavailable' }, { status: 503 });
  const rows = await IntegrationSetting.find({ provider: { $in: Object.keys(PROVIDERS) } }).lean();
  const byProvider = new Map(rows.map((row) => [row.provider, row]));
  const integrations = Object.fromEntries(Object.entries(PROVIDERS).map(([provider, spec]) => {
    const row = byProvider.get(provider);
    const credentials = row?.credentials || {};
    return [provider, {
      provider,
      enabled: Boolean(row?.enabled),
      publicConfig: row?.publicConfig || {},
      configuredFields: Object.fromEntries(spec.secretFields.map((field) => [field, Boolean(credentials[field])])),
      updatedAt: row?.updatedAt || null
    }];
  }));
  return NextResponse.json({ integrations }, { headers: { 'cache-control': 'no-store' } });
}

export async function PUT(request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: 'Admin role required' }, { status: 403 });
  const body = await request.json().catch(() => null);
  const spec = body && PROVIDERS[body.provider];
  if (!spec) return NextResponse.json({ error: 'Unknown provider' }, { status: 400 });
  const mongo = await connectToDatabase();
  if (!mongo.connected) return NextResponse.json({ error: 'MongoDB unavailable' }, { status: 503 });

  const existing = await IntegrationSetting.findOne({ provider: body.provider }).lean();
  const credentials = { ...(existing?.credentials || {}) };
  for (const field of spec.secretFields) {
    if (body.clearFields?.includes(field)) delete credentials[field];
    const value = String(body.credentials?.[field] || '').trim();
    if (value) credentials[field] = encryptSecret(value);
  }
  const publicConfig = {};
  for (const field of spec.publicFields) publicConfig[field] = String(body.publicConfig?.[field] || '').trim().slice(0, 300);

  await IntegrationSetting.findOneAndUpdate(
    { provider: body.provider },
    { provider: body.provider, enabled: Boolean(body.enabled), credentials, publicConfig, updatedBy: session.user.email },
    { upsert: true, runValidators: true }
  );
  return NextResponse.json({ ok: true, provider: body.provider, configuredFields: Object.fromEntries(spec.secretFields.map((field) => [field, Boolean(credentials[field])])) });
}
