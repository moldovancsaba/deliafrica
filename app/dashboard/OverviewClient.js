'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function OverviewClient() {
  const [health, setHealth] = useState(null);
  const [users, setUsers] = useState(null);
  useEffect(() => {
    const load = () => fetch('/api/health', { cache: 'no-store' }).then(r => r.json()).then(setHealth).catch(() => {});
    const loadUsers = () => fetch('/api/admin/users', { cache: 'no-store' }).then(r => r.ok ? r.json() : null).then(data => data && setUsers(data.users || [])).catch(() => {});
    load(); loadUsers(); const timer = setInterval(load, 15000); return () => clearInterval(timer);
  }, []);
  const orderCount = health?.orders?.available ? health.orders.total : '—';
  const openCount = health?.orders?.available ? health.orders.open : '—';
  const adminCount = users ? users.filter(user => user.role === 'admin').length : '—';
  return <>
    <div className="admin-page-head"><div><span className="admin-kicker">GENERAL DASHBOARD</span><h1>Áttekintés</h1><p>Rendszerállapot, értékesítés, felhasználók és admin navigáció egy helyen.</p></div></div>
    <section className="admin-grid">
      <article className="admin-card"><small>MongoDB</small><strong>{health?.mongo?.connected ? 'Connected' : 'Unavailable'}</strong></article>
      <article className="admin-card"><small>Regisztrált felhasználók</small><strong>{users ? users.length : '—'}</strong></article>
      <article className="admin-card"><small>Adminok</small><strong>{adminCount}</strong></article>
      <article className="admin-card"><small>Összes rendelés</small><strong>{orderCount}</strong></article>
      <article className="admin-card"><small>Nyitott rendelés</small><strong>{openCount}</strong></article>
      <article className="admin-card"><small>Health latency</small><strong>{health ? `${health.latencyMs} ms` : '…'}</strong></article>
    </section>
    <section className="admin-panel"><h2>Admin területek</h2><div className="admin-grid">
      <Link className="admin-card" href="/dashboard/users"><small>Accounts</small><strong>Felhasználók</strong><p>Regisztrált fiókok, rendelések és admin jogosultságok.</p></Link>
      <Link className="admin-card" href="/dashboard/products"><small>Katalógus</small><strong>Termékek</strong><p>CRUD, készlet, ár, méret, parcel adatok.</p></Link>
      <Link className="admin-card" href="/dashboard/orders"><small>Sales</small><strong>Rendelések</strong><p>Fizetés, számla, fulfilment, delivery státuszok.</p></Link>
      <Link className="admin-card" href="/dashboard/integrations"><small>Providers</small><strong>Integrációk</strong><p>Packeta, Barion, Billingo kulcsok és állapot.</p></Link>
      <Link className="admin-card" href="/dashboard/content"><small>CMS</small><strong>Tartalom</strong><p>Minden storefront szöveg szerkesztése.</p></Link>
    </div></section>
  </>;
}
