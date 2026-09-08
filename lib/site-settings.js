import 'server-only';
import { unstable_noStore as noStore } from 'next/cache';
import { connectToDatabase } from '@/lib/db';
import { DEFAULT_HERO_MODE, HERO_MODES } from '@/lib/hero-config';
import SiteSetting from '@/models/SiteSetting';
import { DEFAULT_SITE_SETTINGS, DEFAULT_STOREFRONT_CONTENT, DEFAULT_SALES_SETTINGS } from '@/lib/site-config';

export async function getSiteSettings() {
  noStore();
  const mongo = await connectToDatabase();
  if (!mongo.connected) return DEFAULT_SITE_SETTINGS;
  const saved = await SiteSetting.find({ key: { $in: Object.keys(DEFAULT_SITE_SETTINGS) } }).lean();
  const values = Object.fromEntries(saved.map((item) => [item.key, item.value]));
  return {
    ...DEFAULT_SITE_SETTINGS,
    ...values,
    storefrontContent: { ...DEFAULT_STOREFRONT_CONTENT, ...(values.storefrontContent || {}) },
    sales: { ...DEFAULT_SALES_SETTINGS, ...(values.sales || {}) }
  };
}

export async function getHeroMode() {
  const settings = await getSiteSettings();
  return HERO_MODES.includes(settings.heroMode) ? settings.heroMode : DEFAULT_HERO_MODE;
}
