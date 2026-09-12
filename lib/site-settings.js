import 'server-only';
import { unstable_noStore as noStore } from 'next/cache';
import { connectToDatabase } from '@/lib/db';
import { DEFAULT_HERO_MODE, HERO_MODES } from '@/lib/hero-config';
import SiteSetting from '@/models/SiteSetting';
import { DEFAULT_SITE_SETTINGS, DEFAULT_STOREFRONT_CONTENT, DEFAULT_SALES_SETTINGS, DEFAULT_LEGAL_SETTINGS, DEFAULT_ANALYTICS_SETTINGS } from '@/lib/site-config';
import { DEFAULT_STOREFRONT_UI_COPY } from '@/lib/storefront-copy';
import { getCustomerDirectSiteSettings } from '@/lib/customer-direct-store';

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
  if (!mongo.connected) {
    const fallback = { ...DEFAULT_SITE_SETTINGS, uiCopy: DEFAULT_STOREFRONT_UI_COPY };
    return await getCustomerDirectSiteSettings(fallback) || fallback;
  }
  const saved = await SiteSetting.find({ key: { $in: Object.keys(DEFAULT_SITE_SETTINGS) } }).lean();
  const values = Object.fromEntries(saved.map((item) => [item.key, item.value]));
  const local = {
    ...DEFAULT_SITE_SETTINGS,
    ...values,
    storefrontContent: { ...DEFAULT_STOREFRONT_CONTENT, ...(values.storefrontContent || {}) },
    uiCopy: deepMerge(DEFAULT_STOREFRONT_UI_COPY, values.uiCopy || {}),
    legal: deepMerge(DEFAULT_LEGAL_SETTINGS, values.legal || {}),
    sales: { ...DEFAULT_SALES_SETTINGS, ...(values.sales || {}) },
    analytics: { ...DEFAULT_ANALYTICS_SETTINGS, ...(values.analytics || {}) }
  };
  return await getCustomerDirectSiteSettings(local) || local;
}

export async function getHeroMode() {
  const settings = await getSiteSettings();
  return HERO_MODES.includes(settings.heroMode) ? settings.heroMode : DEFAULT_HERO_MODE;
}
