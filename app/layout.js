import './globals.css';
import './card-branding.css';
import './product-pages.css';
import './mobile-product-fixes.css';
import './modal-white.css';
import './mobile-hero-fixes.css';
import './legal-footer.css';
import './brand-theme.css';
import CookieConsent from '@/app/components/CookieConsent';
import ConsentAnalytics from '@/app/components/ConsentAnalytics';
import GlobalStoreFooter from '@/app/components/GlobalStoreFooter';
import MobileMenu from '@/app/components/MobileMenu';
import { getSiteSettings } from '@/lib/site-settings';
import { APP_VERSION } from '@/lib/version';

export async function generateMetadata() {
  const settings = await getSiteSettings();
  return {
    metadataBase: new URL('https://deliafrica.vercel.app'),
    title: settings.uiCopy.seo?.siteTitle,
    description: settings.uiCopy.seo?.siteDescription,
    themeColor: '#ff0d00',
    openGraph: { siteName: settings.legal?.company?.companyName, locale: 'hu_HU', type: 'website', title: settings.uiCopy.seo?.siteTitle, description: settings.uiCopy.seo?.siteDescription }
  };
}

export default async function RootLayout({ children }) {
  const settings = await getSiteSettings();
  const measurementId = settings.analytics?.googleAnalyticsMeasurementId || '';
  const googleAnalyticsEnabled = settings.analytics?.googleAnalyticsEnabled && /^G-[A-Z0-9]+$/i.test(measurementId);
  return <html lang="hu"><body>{children}<MobileMenu/><GlobalStoreFooter legal={settings.legal} copy={settings.uiCopy} version={APP_VERSION}/><CookieConsent copy={settings.legal?.cookieBanner}/><ConsentAnalytics googleAnalyticsMeasurementId={googleAnalyticsEnabled ? measurementId : ''}/></body></html>;
}
