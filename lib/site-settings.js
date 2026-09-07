import 'server-only';
import { unstable_noStore as noStore } from 'next/cache';
import { connectToDatabase } from '@/lib/db';
import { DEFAULT_HERO_MODE, HERO_MODES } from '@/lib/hero-config';
import SiteSetting from '@/models/SiteSetting';

export async function getHeroMode() {
  noStore();
  const mongo = await connectToDatabase();
  if (!mongo.connected) return DEFAULT_HERO_MODE;
  const setting = await SiteSetting.findOne({ key: 'heroMode' }).lean();
  return HERO_MODES.includes(setting?.value) ? setting.value : DEFAULT_HERO_MODE;
}
