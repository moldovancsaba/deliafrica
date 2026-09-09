'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const money = (value, currency='HUF') => new Intl.NumberFormat('hu-HU', { style:'currency', currency }).format(Number(value) || 0);
const date = (value) => value ? new Intl.DateTimeFormat('hu-HU', { dateStyle:'medium', timeStyle:'short' }).format(new Date(value)) : '—';

function Status({ label, value }) {
  return <div><small>{label}</small><br/><span className="status-pill">{value || '—'}</span></div>;
}

export default function UserHistoryClient({ ssoUserId }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/admin/users/${encodeURIComponent(ssoUserId)}`, { cache:'no-store' })
      .then(async res => { const body = await res.json(); if (!res.ok) throw new Error(body.error || 'Betöltési hiba'); return body; })
      .then(setData).catch(error => setError(error.message));
  }, [ssoUserId]);

  if (error) return <div className="admin-error">{error}</div>;
  if (!data) return <p>Betöltés…</p>;
  const { user, summary, profile, orders } = data;

  return <>
    <div className="admin-page-head"><div><span className="admin-kicker">CUSTOMER HISTORY</span><h1>{user.name || user.email || 'Felhasználó'}</h1><p>{user.email} · {user.ssoUserId}</p></div><Link className="admin-button light" href="/dashboard/users">← Vissza a felhasználókhoz</Link></div>

    <section className="admin-grid">
      <article className="admin-card"><small>Rendelések</small><strong>{summary.orderCount}</strong></article>
      <article className="admin-card"><small>Összes költés</small><strong>{money(summary.totalSpent)}</strong></article>
      <article className="admin-card"><small>Átlagos kosár</small><strong>{money(summary.averageOrderValue)}</strong></article>
      <article className="admin-card"><small>Kiszállítva</small><strong>{summary.deliveredOrders}</strong></article>
    </section>

    <section className="admin-panel">
      <h2>Fiók és ügyfélprofil</h2>
      <div className="order-detail-grid">
        <div><p><b>Szerepkör:</b> {user.role}</p><p><b>SSO szerepkör:</b> {user.ssoRole}</p><p><b>SSO státusz:</b> {user.ssoStatus}</p><p><b>Első bejelentkezés:</b> {date(user.firstLoginAt)}</p><p><b>Utolsó bejelentkezés:</b> {date(user.lastLoginAt)}</p><p><b>Utolsó aktivitás:</b> {date(user.lastSeenAt)}</p></div>
        <div><p><b>Telefonszámok:</b> {profile.phones.join(', ') || '—'}</p><p><b>Címek:</b></p>{profile.addresses.length ? <ul>{profile.addresses.map(address => <li key={address}>{address}</li>)}</ul> : <p>—</p>}<p><b>Adószámok:</b> {profile.taxNumbers.join(', ') || '—'}</p></div>
      </div>
    </section>

    <section className="admin-panel">
      <h2>Rendelési előzmények</h2>
      {orders.length === 0 ? <p className="muted">Nincs rendelési előzmény.</p> : orders.map(order => <article className="user-order-history" key={order.reference}>
        <div className="user-order-head"><div><b>{order.reference}</b><br/><small>{date(order.createdAt)}</small></div><strong>{money(order.total, order.currency || 'HUF')}</strong></div>
        <div className="user-order-statuses"><Status label="Rendelés" value={order.orderStatus}/><Status label="Fizetés" value={order.paymentStatus}/><Status label="Számla" value={order.invoiceStatus}/><Status label="Összekészítés" value={order.fulfilmentStatus}/><Status label="Kiszállítás" value={order.deliveryStatus}/></div>
        <div className="order-detail-grid">
          <div><h3>Termékek</h3>{order.items.map((item,index) => <p key={`${order.reference}-${item.productId}-${index}`}><b>{item.name}</b> × {item.quantity} · {money(item.unitPrice, order.currency || 'HUF')}</p>)}</div>
          <div><h3>Szállítás / számlázás</h3><p>{order.customerName}<br/>{order.email}<br/>{order.phone || ''}<br/>{order.address}</p>{order.billingAddress && <p><b>Számlázási cím:</b><br/>{order.billingName || order.customerName}<br/>{order.billingAddress}</p>}</div>
        </div>
        <div className="order-detail-grid">
          <div><h3>Tranzakciók</h3><p><b>Fizetve:</b> {date(order.paidAt)}</p><p><b>Transaction ID:</b> {order.paymentTransactionId || '—'}</p><p><b>Számlaszám:</b> {order.invoiceNumber || '—'}</p><p><b>Számlázva:</b> {date(order.invoicedAt)}</p></div>
          <div><h3>Logisztika</h3><p><b>Packeta pont:</b> {order.packetaPointId || '—'}</p><p><b>Parcel ID:</b> {order.parcelId || '—'}</p><p><b>Tracking:</b> {order.trackingNumber || '—'}</p><p><b>Kézbesítve:</b> {date(order.deliveredAt)}</p></div>
        </div>
        {(order.customerNote || order.adminNote) && <div><h3>Megjegyzések</h3>{order.customerNote && <p><b>Vásárló:</b> {order.customerNote}</p>}{order.adminNote && <p><b>Admin:</b> {order.adminNote}</p>}</div>}
        {order.statusHistory?.length > 0 && <div><h3>Státusz történet</h3><div className="timeline">{order.statusHistory.slice().reverse().map((event,index) => <div key={`${order.reference}-history-${index}`}><b>{event.field}</b>: {event.from || '—'} → {event.to}<br/><small>{date(event.at)} · {event.changedBy || 'system'}{event.note ? ` · ${event.note}` : ''}</small></div>)}</div></div>}
      </article>)}
    </section>
  </>;
}
