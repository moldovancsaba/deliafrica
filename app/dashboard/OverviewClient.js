'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function OverviewClient() {
  const [health, setHealth] = useState(null);
  useEffect(() => {
    const load = () => fetch('/api/health', { cache: 'no-store' }).then(r => r.json()).then(setHealth).catch(() => {});
    load(); const timer = setInterval(load, 15000); return () => clearInterval(timer);
  }, []);
  const orderCount = health?.orders?.available ? health.orders.total : '—';
  const openCount = health?.orders?.available ? health.orders.open : '—';
  return <>
    <div className="admin-page-head"><div><span className="admin-kicker">GENERAL DASHBOARD</span><h1>Áttekintés</h1><p>Rendszerállapot, értékesítés és admin navigáció egy helyen.</p></div></div>
    <section className="admin-grid">
      <article className="admin-card"><small>MongoDB</small><strong>{health?.mongo?.connected ? 'Connected' : 'Unavailable'}</strong></article>
      <article className="admin-card"><small>Összes rendelés</small><strong>{orderCount}</strong></article>
      <article className="admin-card"><small>Nyitott rendelés</small><strong>{openCount}</strong></article>
      <article className="admin-card"><small>Health latency</small><strong>{health ? `${health.latencyMs} ms` : '…'}</strong></article>
    </section>
    <section className="admin-panel"><h2>Admin területek</h2><div className="admin-grid">
      <Link className="admin-card" href="/dashboard/products"><small>Katalógus</small><strong>Termékek</strong><p>CRUD, készlet, ár, méret, parcel adatok.</p></Link>
      <Link className="admin-card" href="/dashboard/orders"><small>Sales</small><strong>Rendelések</strong><p>Fizetés, számla, fulfilment, delivery státuszok.</p></Link>
      <Link className="admin-card" href="/dashboard/integrations"><small>Providers</small><strong>Integrációk</strong><p>Packeta, Barion, Billingo kulcsok és állapot.</p></Link>
      <Link className="admin-card" href="/dashboard/content"><small>CMS</small><strong>Tartalom</strong><p>Minden storefront szöveg szerkesztése.</p></Link>
    </div></section>
  </>;
}
