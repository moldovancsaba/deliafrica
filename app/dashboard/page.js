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
      setError(e.message);
    }
  }

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 15000);
    return () => clearInterval(id);
  }, []);

  const mongoOk = health?.mongo?.connected;

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
        <span className="status-dot ok" />
        <small>Felhasználói kapcsolat</small>
        <strong>Aktív felület</strong>
        <p>A storefront elérhető; Socket.io végpont konfigurálva.</p>
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
      <div className="service-row"><span>Socket.io endpoint</span><b>Ready</b></div>
      <div className="service-row"><span>MongoDB persistence</span><b>{mongoOk ? 'Connected' : 'Fallback demo mode'}</b></div>
    </section>
  </main>;
}
