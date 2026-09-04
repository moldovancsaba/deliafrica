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
  const [dimensions, setDimensions] = useState([]);
  const [saveState, setSaveState] = useState('');
  async function refresh() {
    try { const res = await fetch('/api/health', { cache: 'no-store' }); if (!res.ok) throw new Error('Health endpoint failed'); setHealth(await res.json()); setError(''); }
    catch (e) { setError(e instanceof Error ? e.message : 'Health endpoint failed'); }
  }
  useEffect(() => { refresh(); const id = setInterval(refresh, 15000); return () => clearInterval(id); }, []);
  useEffect(() => { fetch('/api/product-settings', { cache: 'no-store' }).then((res) => res.json()).then((data) => setDimensions(data.products || [])).catch(() => setError('A termékméretek nem tölthetők be.')); }, []);
  function changeDimension(id, field, value) { setDimensions((current) => current.map((item) => item.id === id ? { ...item, [field]: value } : item)); }
  async function saveDimension(item) {
    setSaveState(item.id);
    const res = await fetch('/api/product-settings', { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ productId: item.id, width: Number(item.width), height: Number(item.height) }) });
    setSaveState(res.ok ? `saved:${item.id}` : `error:${item.id}`);
  }
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
    <section className="dimension-panel"><div><span>PRODUCT DISPLAY SETTINGS</span><h2>Valós termékméretek</h2><p>Add meg a csomagolás szélességét és magasságát milliméterben. A hero ezeket az arányokat használja.</p></div><div className="dimension-list">{dimensions.map((item) => <form key={item.id} onSubmit={(event) => { event.preventDefault(); saveDimension(item); }}><b>{item.name}</b><label>Szélesség (mm)<input type="number" min="1" max="2000" step="1" value={item.width} onChange={(event) => changeDimension(item.id, 'width', event.target.value)} /></label><label>Magasság (mm)<input type="number" min="1" max="2000" step="1" value={item.height} onChange={(event) => changeDimension(item.id, 'height', event.target.value)} /></label><button className="button button-red" disabled={saveState === item.id}>{saveState === item.id ? 'Mentés…' : saveState === `saved:${item.id}` ? 'Mentve ✓' : 'Mentés'}</button></form>)}</div></section>
  </main>;
}
