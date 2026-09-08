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

export const metadata = {
  metadataBase: new URL('https://deliafrica.vercel.app'),
  title: 'deli.africa — Dél-Afrika, válogatva',
  description: 'Kurált dél-afrikai ízek: peri-peri, chutney, rooibos, braai fűszerek és klasszikus snackek.',
  themeColor: '#ff0d00',
  openGraph: { siteName: 'deli.africa', locale: 'hu_HU', type: 'website' }
};

export default async function RootLayout({ children }) {
  const settings = await getSiteSettings();
  return <html lang="hu"><body>{children}<MobileMenu/><GlobalStoreFooter legal={settings.legal} copy={settings.uiCopy} version={APP_VERSION}/><CookieConsent copy={settings.legal?.cookieBanner} /><ConsentAnalytics /></body></html>;
}
