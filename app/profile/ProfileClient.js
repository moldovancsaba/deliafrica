'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import BrandLogo from '@/app/components/BrandLogo';

const empty = {
  name: '', email: '', phone: '',
  shippingAddress: { recipientName:'', phone:'', country:'Hungary', postalCode:'', city:'', addressLine1:'', addressLine2:'', deliveryNote:'' },
  billingDetails: { billingName:'', companyName:'', taxNumber:'', country:'Hungary', postalCode:'', city:'', addressLine1:'', addressLine2:'' }
};

function money(value, currency='HUF') {
  return new Intl.NumberFormat('hu-HU', { style:'currency', currency, maximumFractionDigits:0 }).format(Number(value) || 0);
}

function date(value) {
  if (!value) return '—';
  try { return new Intl.DateTimeFormat('hu-HU', { dateStyle:'medium', timeStyle:'short' }).format(new Date(value)); } catch { return '—'; }
}

export default function ProfileClient() {
  const [profile, setProfile] = useState(empty);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function load() {
    setLoading(true); setError('');
    const res = await fetch('/api/profile', { cache:'no-store' });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) setError(data.error || 'Nem sikerült betölteni a profilt.');
    else {
      setProfile({
        ...empty,
        ...(data.profile || {}),
        shippingAddress: { ...empty.shippingAddress, ...(data.profile?.shippingAddress || {}) },
        billingDetails: { ...empty.billingDetails, ...(data.profile?.billingDetails || {}) }
      });
      setOrders(data.orders || []);
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function setField(section, key, value) {
    if (!section) return setProfile(current => ({ ...current, [key]: value }));
    setProfile(current => ({ ...current, [section]: { ...current[section], [key]: value } }));
  }

  function copyShippingToBilling() {
    const s = profile.shippingAddress;
    setProfile(current => ({ ...current, billingDetails: { ...current.billingDetails, billingName: current.billingDetails.billingName || s.recipientName, country:s.country, postalCode:s.postalCode, city:s.city, addressLine1:s.addressLine1, addressLine2:s.addressLine2 } }));
  }

  async function save(event) {
    event.preventDefault(); setSaving(true); setMessage(''); setError('');
    const res = await fetch('/api/profile', { method:'PUT', headers:{'content-type':'application/json'}, body:JSON.stringify(profile) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) setError(data.error || 'A mentés sikertelen.');
    else setMessage('Profiladatok mentve. A mentett címek a következő rendelésnél is használhatók.');
    setSaving(false);
  }

  const totalSpent = useMemo(() => orders.reduce((sum, order) => sum + (Number(order.total) || 0), 0), [orders]);

  if (loading) return <main className="profile-shell"><div className="profile-loading">Profil betöltése…</div></main>;

  return <main className="profile-shell">
    <header className="profile-header">
      <Link href="/" className="profile-logo" aria-label="deli.africa"><BrandLogo /></Link>
      <div className="profile-header-actions"><Link href="/">Vissza a shophoz</Link><a href="/api/auth/logout">Kijelentkezés</a></div>
    </header>

    <section className="profile-hero">
      <span>SAJÁT FIÓK</span>
      <h1>Profil</h1>
      <p>{profile.name || 'Vásárló'} · {profile.email}</p>
    </section>

    {message && <div className="profile-message">{message}</div>}
    {error && <div className="profile-error">{error}</div>}

    <section className="profile-stats">
      <article><small>Rendelések</small><strong>{orders.length}</strong></article>
      <article><small>Összes vásárlás</small><strong>{money(totalSpent)}</strong></article>
      <article><small>Utolsó rendelés</small><strong>{orders[0] ? date(orders[0].createdAt) : '—'}</strong></article>
    </section>

    <form className="profile-form" onSubmit={save}>
      <section className="profile-panel">
        <div className="profile-panel-head"><div><span>KAPCSOLAT</span><h2>Alapadatok</h2></div></div>
        <div className="profile-grid">
          <label>Név<input value={profile.name || ''} disabled /></label>
          <label>E-mail<input value={profile.email || ''} disabled /></label>
          <label>Telefonszám<input value={profile.phone || ''} onChange={e=>setField(null,'phone',e.target.value)} placeholder="+36…" /></label>
        </div>
      </section>

      <section className="profile-panel">
        <div className="profile-panel-head"><div><span>SZÁLLÍTÁS</span><h2>Mentett szállítási cím</h2></div><small>Ezt az adatot használhatod a következő rendeléseknél.</small></div>
        <div className="profile-grid">
          <label>Címzett neve<input value={profile.shippingAddress.recipientName} onChange={e=>setField('shippingAddress','recipientName',e.target.value)} /></label>
          <label>Telefonszám<input value={profile.shippingAddress.phone} onChange={e=>setField('shippingAddress','phone',e.target.value)} /></label>
          <label>Ország<input value={profile.shippingAddress.country} onChange={e=>setField('shippingAddress','country',e.target.value)} /></label>
          <label>Irányítószám<input value={profile.shippingAddress.postalCode} onChange={e=>setField('shippingAddress','postalCode',e.target.value)} /></label>
          <label>Város<input value={profile.shippingAddress.city} onChange={e=>setField('shippingAddress','city',e.target.value)} /></label>
          <label className="wide">Cím<input value={profile.shippingAddress.addressLine1} onChange={e=>setField('shippingAddress','addressLine1',e.target.value)} placeholder="Utca, házszám" /></label>
          <label className="wide">Cím 2<input value={profile.shippingAddress.addressLine2} onChange={e=>setField('shippingAddress','addressLine2',e.target.value)} placeholder="Emelet, ajtó, épület – opcionális" /></label>
          <label className="wide">Szállítási megjegyzés<textarea value={profile.shippingAddress.deliveryNote} onChange={e=>setField('shippingAddress','deliveryNote',e.target.value)} /></label>
        </div>
      </section>

      <section className="profile-panel">
        <div className="profile-panel-head"><div><span>SZÁMLÁZÁS</span><h2>Mentett számlázási adatok</h2></div><button type="button" className="profile-link-button" onClick={copyShippingToBilling}>Szállítási cím másolása</button></div>
        <div className="profile-grid">
          <label>Számlázási név<input value={profile.billingDetails.billingName} onChange={e=>setField('billingDetails','billingName',e.target.value)} /></label>
          <label>Cégnév<input value={profile.billingDetails.companyName} onChange={e=>setField('billingDetails','companyName',e.target.value)} /></label>
          <label>Adószám<input value={profile.billingDetails.taxNumber} onChange={e=>setField('billingDetails','taxNumber',e.target.value)} /></label>
          <label>Ország<input value={profile.billingDetails.country} onChange={e=>setField('billingDetails','country',e.target.value)} /></label>
          <label>Irányítószám<input value={profile.billingDetails.postalCode} onChange={e=>setField('billingDetails','postalCode',e.target.value)} /></label>
          <label>Város<input value={profile.billingDetails.city} onChange={e=>setField('billingDetails','city',e.target.value)} /></label>
          <label className="wide">Számlázási cím<input value={profile.billingDetails.addressLine1} onChange={e=>setField('billingDetails','addressLine1',e.target.value)} /></label>
          <label className="wide">Számlázási cím 2<input value={profile.billingDetails.addressLine2} onChange={e=>setField('billingDetails','addressLine2',e.target.value)} /></label>
        </div>
      </section>

      <div className="profile-save"><button disabled={saving}>{saving ? 'MENTÉS…' : 'ADATOK MENTÉSE'}</button></div>
    </form>

    <section className="profile-panel profile-orders">
      <div className="profile-panel-head"><div><span>ELŐZMÉNYEK</span><h2>Rendeléseim</h2></div></div>
      {orders.length === 0 ? <p className="profile-muted">Még nincs rendelésed.</p> : <div className="profile-order-list">{orders.map(order => <article key={order.reference}>
        <div><b>{order.reference}</b><small>{date(order.createdAt)}</small></div>
        <div><span>{order.items?.map(item => `${item.name} × ${item.quantity}`).join(', ')}</span><small>Fizetés: {order.paymentStatus} · Szállítás: {order.deliveryStatus}</small></div>
        <strong>{money(order.total, order.currency || 'HUF')}</strong>
        {order.trackingUrl && <a href={order.trackingUrl} target="_blank" rel="noreferrer">Csomag követése</a>}
      </article>)}</div>}
    </section>
  </main>;
}
