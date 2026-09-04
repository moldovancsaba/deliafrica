'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Dashboard() {
  const [health, setHealth] = useState(null);
  const [error, setError] = useState('');

  async function refresh() {
    try {
      const res = await fetch('/api/health', { cache: 'no-store' });
      if (!res.ok) throw new Error('Health endpoint failed');
      setHealth(await res.json());
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Health endpoint failed');
    }
  }

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 15000);
    return () => clearInterval(id);
  }, []);

  const mongoOk = health?.mongo?.connected;
  const userState = health?.users?.state || 'Ellenőrzés…';
  const userTracking = health?.users?.tracking === 'enabled';

  return <main className="dashboard-shell">
    <div className="dashboard-top">
      <Link href="/" className="brand compact">deli.<strong>africa</strong></Link>
      <button onClick={refresh} className="button button-dark">Frissítés</button>
    </div>

    <div className="dashboard-title">
      <span>GENERAL DASHBOARD</span>
      <h1>Rendszerállapot</h1>
      <p>Élő egészségügyi áttekintés a webshophoz.</p>
    </div>

    {error && <div className="alert">{error}</div>}

    <section className="metric-grid">
      <article className="metric">
        <span className={`status-dot ${mongoOk ? 'ok' : 'warn'}`} />
        <small>MongoDB</small>
        <strong>{health ? health.mongo.state : 'Ellenőrzés…'}</strong>
        <p>{health?.mongo?.configured === false ? 'MONGODB_URI nincs beállítva.' : 'Adatbázis-kapcsolat állapota.'}</p>
      </article>
      <article className="metric">
        <span className={`status-dot ${userTracking && health?.users?.active > 0 ? 'ok' : 'warn'}`} />
        <small>Felhasználói kapcsolat</small>
        <strong>{userState}</strong>
        <p>{userTracking ? `${health.users.active} aktív Socket.io kapcsolat.` : 'A Socket.io jelenlét-számlálás még nincs bekapcsolva.'}</p>
      </article>
      <article className="metric">
        <small>Környezet</small>
        <strong>{health?.environment || '…'}</strong>
        <p>{health?.runtime || '…'} runtime</p>
      </article>
      <article className="metric">
        <small>Health latency</small>
        <strong>{health ? `${health.latencyMs} ms` : '…'}</strong>
        <p>API válaszidő az utolsó ellenőrzésnél.</p>
      </article>
    </section>

    <section className="dashboard-panel">
      <h2>Szolgáltatások</h2>
      <div className="service-row"><span>Storefront</span><b>Online</b></div>
      <div className="service-row"><span>Orders API</span><b>Online</b></div>
      <div className="service-row"><span>Socket.io endpoint</span><b>{health?.realtime?.status === 'endpoint-ready' ? 'Ready' : 'Checking'}</b></div>
      <div className="service-row"><span>MongoDB persistence</span><b>{mongoOk ? 'Connected' : 'Fallback demo mode'}</b></div>
    </section>
  </main>;
}
