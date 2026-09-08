'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

function money(value) {
  return `${new Intl.NumberFormat('hu-HU').format(Number(value) || 0)} Ft`;
}

function date(value) {
  if (!value) return '—';
  try { return new Intl.DateTimeFormat('hu-HU', { dateStyle:'medium', timeStyle:'short' }).format(new Date(value)); }
  catch { return '—'; }
}

export default function UsersClient() {
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function load() {
    setLoading(true); setError('');
    const res = await fetch('/api/admin/users', { cache:'no-store' });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) setError(data.error || 'Nem sikerült betölteni a felhasználókat.');
    else setUsers(data.users || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return users;
    return users.filter(user => [user.name,user.email,user.ssoUserId,user.role].some(value => String(value || '').toLowerCase().includes(needle)));
  }, [users, query]);

  const admins = users.filter(user => user.role === 'admin').length;
  const buyers = users.filter(user => user.orderCount > 0).length;

  async function setRole(user, role) {
    if (user.role === role) return;
    const action = role === 'admin' ? 'admin jogosultságot adsz' : 'visszavonod az admin jogosultságot';
    if (!confirm(`Biztosan ${action} ennek a felhasználónak: ${user.email || user.name}?`)) return;
    setSaving(user.ssoUserId); setError(''); setMessage('');
    const res = await fetch('/api/admin/users', { method:'PATCH', headers:{'content-type':'application/json'}, body:JSON.stringify({ ssoUserId:user.ssoUserId, role }) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) setError(data.error || 'A jogosultság módosítása sikertelen.');
    else { setMessage(role === 'admin' ? 'Admin jogosultság megadva.' : 'Admin jogosultság visszavonva.'); await load(); }
    setSaving('');
  }

  return <>
    <div className="admin-page-head"><div><span className="admin-kicker">USER MANAGEMENT</span><h1>Felhasználók</h1><p>Regisztrált vásárlók, aktivitás, teljes rendelési előzmény és admin jogosultságok.</p></div></div>
    <section className="admin-grid">
      <article className="admin-card"><small>Regisztrált felhasználó</small><strong>{users.length}</strong></article>
      <article className="admin-card"><small>Admin</small><strong>{admins}</strong></article>
      <article className="admin-card"><small>Vásárló rendelésekkel</small><strong>{buyers}</strong></article>
      <article className="admin-card"><small>Összes rendelés</small><strong>{users.reduce((sum,u)=>sum+(u.orderCount||0),0)}</strong></article>
    </section>
    <section className="admin-panel">
      <div className="admin-toolbar"><input className="admin-search" placeholder="Keresés név, e-mail, SSO ID vagy szerepkör alapján" value={query} onChange={e=>setQuery(e.target.value)} /><button className="admin-button light" onClick={load}>Frissítés</button></div>
      {message && <div className="admin-message">{message}</div>}{error && <div className="admin-error">{error}</div>}
      {loading ? <p>Betöltés…</p> : <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Felhasználó</th><th>Szerepkör</th><th>Regisztráció / aktivitás</th><th>Rendelések</th><th>Jogosultság</th></tr></thead><tbody>
        {filtered.map(user => <tr key={user.ssoUserId}>
          <td><Link className="admin-user-link" href={`/dashboard/users/${encodeURIComponent(user.ssoUserId)}`}><b>{user.name || 'Névtelen felhasználó'}</b></Link><br/><span className="muted">{user.email || 'Nincs e-mail'}</span><br/><small className="muted">{user.ssoUserId}</small>{user.isCurrentUser && <><br/><span className="status-pill ok">Te</span></>}</td>
          <td><span className={`status-pill ${user.role==='admin'?'ok':''}`}>{user.role}</span>{user.roleOverride && <><br/><small className="muted">helyi override · SSO: {user.ssoRole}</small></>}</td>
          <td><small>Első: {date(user.firstLoginAt)}</small><br/><small>Utolsó login: {date(user.lastLoginAt)}</small><br/><small>Utolsó aktivitás: {date(user.lastSeenAt)}</small></td>
          <td><b>{user.orderCount || 0} db</b><br/><small>{money(user.totalSpent)}</small><br/><small>{user.lastOrderAt ? `Utolsó: ${date(user.lastOrderAt)}` : 'Nincs rendelés'}</small><br/><Link href={`/dashboard/users/${encodeURIComponent(user.ssoUserId)}`}>Teljes előzmény →</Link></td>
          <td>{user.role === 'admin' ? <button className="admin-button light" disabled={saving===user.ssoUserId || user.isCurrentUser} onClick={()=>setRole(user,'user')}>{user.isCurrentUser ? 'Saját admin jog' : 'Admin jog visszavonása'}</button> : <button className="admin-button red" disabled={saving===user.ssoUserId} onClick={()=>setRole(user,'admin')}>Admin jog megadása</button>}</td>
        </tr>)}
      </tbody></table></div>}
      {!loading && filtered.length===0 && <p className="muted">Nincs találat.</p>}
    </section>
  </>;
}
