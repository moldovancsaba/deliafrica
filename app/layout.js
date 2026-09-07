import './globals.css';
import './card-branding.css';
import './product-pages.css';
import './mobile-product-fixes.css';
import './modal-white.css';
import { Analytics } from '@vercel/analytics/next';

export const metadata = {
  metadataBase: new URL('https://deliafrica.vercel.app'),
  title: 'deli.africa — Dél-Afrika, válogatva',
  description: 'Kurált dél-afrikai ízek: peri-peri, chutney, rooibos, braai fűszerek és klasszikus snackek.',
  openGraph: { siteName: 'deli.africa', locale: 'hu_HU', type: 'website' }
};

export default function RootLayout({ children }) {
  return <html lang="hu"><body>{children}<Analytics /></body></html>;
}
