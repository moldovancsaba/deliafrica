import { redirect } from 'next/navigation';
import { getSession, isAuthConfigured } from '@/lib/auth';
import DashboardClient from './DashboardClient';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  if (!isAuthConfigured()) return <main className="auth-state"><span className="eyebrow dark">ADMIN ACCESS</span><h1>Az admin belépés előkészítve.</h1><p>A dashboard zárva marad, amíg a DoneIsBetter SSO kliensazonosító nincs beállítva.</p><a href="/">Vissza a webshophoz</a></main>;
  const session = await getSession();
  if (!session) redirect('/api/auth/login?returnTo=/dashboard');
  if (session.permission.status !== 'approved' || session.permission.role !== 'admin') {
    return <main className="auth-state"><span className="eyebrow dark">ADMIN ACCESS</span><h1>Nincs admin jogosultságod.</h1><p>Az SSO alkalmazás-hozzáférésnek jóváhagyott állapotúnak, a szerepkörnek pedig adminnak kell lennie.</p><a className="button button-dark" href="/api/auth/logout">Másik fiókkal lépek be</a><a href="/">Vissza a webshophoz</a></main>;
  }
  return <DashboardClient user={session.user} />;
}
