import 'server-only';
import { unstable_noStore as noStore } from 'next/cache';
import { connectToDatabase } from '@/lib/db';
import { DEFAULT_HERO_MODE, HERO_MODES } from '@/lib/hero-config';
import SiteSetting from '@/models/SiteSetting';
import { DEFAULT_SITE_SETTINGS, DEFAULT_STOREFRONT_CONTENT, DEFAULT_SALES_SETTINGS, DEFAULT_UI_COPY, DEFAULT_LEGAL_SETTINGS } from '@/lib/site-config';

function deepMerge(base, override) {
  if (Array.isArray(base)) return Array.isArray(override) ? override : base;
  if (!base || typeof base !== 'object') return override === undefined ? base : override;
  const result = { ...base };
  for (const [key, value] of Object.entries(override || {})) result[key] = key in base ? deepMerge(base[key], value) : value;
  return result;
}

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
    uiCopy: deepMerge(DEFAULT_UI_COPY, values.uiCopy || {}),
    legal: deepMerge(DEFAULT_LEGAL_SETTINGS, values.legal || {}),
    sales: { ...DEFAULT_SALES_SETTINGS, ...(values.sales || {}) }
  };
}

export async function getHeroMode() {
  const settings = await getSiteSettings();
  return HERO_MODES.includes(settings.heroMode) ? settings.heroMode : DEFAULT_HERO_MODE;
}
