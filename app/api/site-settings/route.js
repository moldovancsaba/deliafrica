import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import { DEFAULT_HERO_MODE, HERO_MODES } from '@/lib/hero-config';
import { getHeroMode } from '@/lib/site-settings';
import SiteSetting from '@/models/SiteSetting';

export const dynamic = 'force-dynamic';

export async function GET() {
  const heroMode = await getHeroMode();
  return NextResponse.json({ heroMode, defaultHeroMode: DEFAULT_HERO_MODE }, { headers: { 'cache-control': 'no-store' } });
}

export async function PUT(request) {
  const session = await getSession();
  if (!session || session.permission.status !== 'approved' || session.permission.role !== 'admin') return NextResponse.json({ error: 'Admin role required' }, { status: 403 });
  const body = await request.json();
  if (!HERO_MODES.includes(body.heroMode)) return NextResponse.json({ error: 'Invalid hero mode' }, { status: 400 });
  const mongo = await connectToDatabase();
  if (!mongo.connected) return NextResponse.json({ error: 'MongoDB unavailable' }, { status: 503 });
  await SiteSetting.findOneAndUpdate({ key: 'heroMode' }, { value: body.heroMode, updatedBy: session.user.email }, { upsert: true, runValidators: true });
  return NextResponse.json({ ok: true, heroMode: body.heroMode });
}
