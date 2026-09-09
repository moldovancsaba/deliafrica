import '@sovereignsquad/gds-theme/styles.css';
import DesignSystemProvider from '@/app/components/DesignSystemProvider';
import CookieConsent from '@/app/components/CookieConsent';
import ConsentAnalytics from '@/app/components/ConsentAnalytics';
import GlobalStoreFooter from '@/app/components/GlobalStoreFooter';
import { getSiteSettings } from '@/lib/site-settings';
import { APP_VERSION } from '@/lib/version';

export async function generateMetadata() {
  const settings = await getSiteSettings();
  return {
    metadataBase: new URL('https://deliafrica.vercel.app'),
    title: settings.uiCopy.seo?.siteTitle,
    description: settings.uiCopy.seo?.siteDescription,
    openGraph: { siteName: settings.legal?.company?.companyName, locale: 'hu_HU', type: 'website', title: settings.uiCopy.seo?.siteTitle, description: settings.uiCopy.seo?.siteDescription }
  };
}

export default async function RootLayout({ children }) {
  const settings = await getSiteSettings();
  const measurementId = settings.analytics?.googleAnalyticsMeasurementId || '';
  const googleAnalyticsEnabled = settings.analytics?.googleAnalyticsEnabled && /^G-[A-Z0-9]+$/i.test(measurementId);
  return <html lang="hu"><body><DesignSystemProvider>{children}<GlobalStoreFooter legal={settings.legal} copy={settings.uiCopy} version={APP_VERSION}/><CookieConsent copy={settings.legal?.cookieBanner}/><ConsentAnalytics googleAnalyticsMeasurementId={googleAnalyticsEnabled ? measurementId : ''}/></DesignSystemProvider></body></html>;
}
