'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import BrandLogo from '@/app/components/BrandLogo';
import { APP_VERSION } from '@/lib/version';

const money = (value) => new Intl.NumberFormat('hu-HU').format(value || 0) + ' Ft';
const uptime = (seconds) => seconds == null ? '…' : `${Math.floor(seconds / 60)} perc`;

export default function DashboardClient({ user }) {
  const [health, setHealth] = useState(null);
  const [error, setError] = useState('');
  async function refresh() {
    try { const res = await fetch('/api/health', { cache: 'no-store' }); if (!res.ok) throw new Error('Health endpoint failed'); setHealth(await res.json()); setError(''); }
    catch (e) { setError(e instanceof Error ? e.message : 'Health endpoint failed'); }
  }
  useEffect(() => { refresh(); const id = setInterval(refresh, 15000); return () => clearInterval(id); }, []);
  const mongoOk = health?.mongo?.connected;
  return <main className="dashboard-shell">
    <div className="dashboard-top"><Link href="/" className="brand-link"><BrandLogo /></Link><div className="admin-account"><span>{user.name}<small>{user.email}</small></span><a className="button button-dark" href="/api/auth/logout">Kijelentkezés</a><button onClick={refresh} className="button button-red">Frissítés</button></div></div>
    <div className="dashboard-title"><span>ADMIN SETTINGS · GENERAL DASHBOARD · v{APP_VERSION}</span><h1>Élő rendszerállapot</h1><p>15 másodpercenként frissülő, SSO-védett produkciós áttekintés.</p>{health && <small>Utolsó mérés: {new Date(health.timestamp).toLocaleString('hu-HU')}</small>}</div>
    {error && <div className="alert">{error}</div>}
    <section className="metric-grid">
      <article className="metric"><span className={`status-dot ${mongoOk ? 'ok' : 'warn'}`} /><small>MongoDB</small><strong>{health ? health.mongo.state : 'Ellenőrzés…'}</strong><p>{health?.mongo?.configured === false ? 'A MongoDB-kapcsolati változó nincs beállítva.' : 'Adatbázis-kapcsolat állapota.'}</p></article>
      <article className="metric"><span className={`status-dot ${health?.authentication?.configured ? 'ok' : 'warn'}`} /><small>SSO</small><strong>{health?.authentication?.configured ? 'Configured' : 'Missing config'}</strong><p>{health?.authentication?.provider || 'DoneIsBetter SSO'} · admin session</p></article>
      <article className="metric"><small>Környezet</small><strong>{health?.environment || '…'}</strong><p>{health?.runtime || '…'} · {health?.deployment?.region || '…'}</p></article>
      <article className="metric"><small>Health latency</small><strong>{health ? `${health.latencyMs} ms` : '…'}</strong><p>API válaszidő az utolsó ellenőrzésnél.</p></article>
      <article className="metric"><small>Összes rendelés</small><strong>{health?.orders?.available ? health.orders.total : 'N/A'}</strong><p>Ma: {health?.orders?.available ? health.orders.today : 'N/A'}</p></article>
      <article className="metric"><small>Nyitott rendelések</small><strong>{health?.orders?.available ? health.orders.open : 'N/A'}</strong><p>Új vagy visszaigazolt állapot.</p></article>
      <article className="metric"><small>Rendelési érték</small><strong>{health?.orders?.available ? money(health.orders.revenue) : 'N/A'}</strong><p>Nem törölt rendelések összesen.</p></article>
      <article className="metric"><small>Folyamat</small><strong>{uptime(health?.process?.uptimeSeconds)}</strong><p>{health?.process?.memoryMb || '…'} MB memória · {health?.process?.node || '…'}</p></article>
    </section>
    <section className="dashboard-panel"><h2>Szolgáltatások és kiadás</h2><div className="service-row"><span>Storefront</span><b>Online</b></div><div className="service-row"><span>Orders API</span><b>SSO protected</b></div><div className="service-row"><span>Detailed health API</span><b>Admin only</b></div><div className="service-row"><span>Socket.io endpoint</span><b>{health?.realtime?.status === 'endpoint-ready' ? 'Ready' : 'Checking'}</b></div><div className="service-row"><span>MongoDB persistence</span><b>{mongoOk ? 'Connected' : 'Unavailable'}</b></div><div className="service-row"><span>Admin identity</span><b>{health?.authentication?.admin?.email || user.email}</b></div><div className="service-row"><span>Release</span><b>v{health?.deployment?.version || APP_VERSION} · {health?.deployment?.commit || '…'}</b></div><div className="service-row"><span>Production URL</span><b>{health?.deployment?.url || '…'}</b></div></section>
  </main>;
}
