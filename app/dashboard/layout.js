import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession, isAuthConfigured } from '@/lib/auth';
import BrandLogo from '@/app/components/BrandLogo';
import './admin.css';

export const dynamic = 'force-dynamic';

const nav = [
  ['/dashboard', 'Áttekintés'],
  ['/dashboard/products', 'Termékek'],
  ['/dashboard/orders', 'Rendelések'],
  ['/dashboard/integrations', 'Integrációk'],
  ['/dashboard/content', 'Tartalom'],
  ['/dashboard/legal', 'Jogi és cégadatok'],
  ['/dashboard/storefront', 'Megjelenés'],
  ['/dashboard/system', 'Rendszer']
];

export default async function DashboardLayout({ children }) {
  if (!isAuthConfigured()) return <main className="auth-state"><h1>Admin belépés nincs konfigurálva.</h1><a href="/">Vissza a webshophoz</a></main>;
  const session = await getSession();
  if (!session) redirect('/api/auth/login?returnTo=/dashboard');
  if (session.permission.status !== 'approved' || session.permission.role !== 'admin') redirect('/');
  return <div className="admin-layout">
    <aside className="admin-sidebar">
      <Link href="/" className="admin-brand"><BrandLogo /></Link>
      <nav>{nav.map(([href, label]) => <Link key={href} href={href}>{label}</Link>)}</nav>
      <div className="admin-user"><b>{session.user.name}</b><span>{session.user.email}</span><a href="/api/auth/logout">Kijelentkezés</a></div>
    </aside>
    <main className="admin-main">{children}</main>
  </div>;
}
