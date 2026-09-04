import './globals.css';

export const metadata = {
  title: 'deli.africa — Dél-Afrika, válogatva',
  description: 'Kurált dél-afrikai ízek: peri-peri, chutney, rooibos, braai fűszerek és klasszikus snackek.'
};

export default function RootLayout({ children }) {
  return <html lang="hu"><body>{children}</body></html>;
}
