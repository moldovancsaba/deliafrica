'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function MobileMenu() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState(null);
  const [copy, setCopy] = useState({ shop:'Shop', story:'Történet', why:'Miért mi?', dashboard:'Dashboard', login:'Belépés' });

  useEffect(() => {
    if (pathname !== '/') return;
    fetch('/api/auth/session', { cache:'no-store' }).then(r => r.json()).then(setSession).catch(() => setSession({ authenticated:false }));
    fetch('/api/site-settings', { cache:'no-store' }).then(r => r.json()).then(data => setCopy(current => ({ ...current, ...(data.uiCopy?.nav || {}) }))).catch(() => {});
  }, [pathname]);

  useEffect(() => { setOpen(false); }, [pathname]);
  if (pathname !== '/') return null;

  const isAdmin = session?.permission?.status === 'approved' && session?.permission?.role === 'admin';
  const close = () => setOpen(false);

  return <div className="mobile-menu-shell">
    <button className={`mobile-menu-toggle ${open ? 'open' : ''}`} aria-label="Menü" aria-expanded={open} onClick={() => setOpen(v => !v)}>
      <span/><span/><span/>
    </button>
    {open && <>
      <button className="mobile-menu-backdrop" aria-label="Menü bezárása" onClick={close}/>
      <div className="mobile-menu-panel">
        <nav>
          <a href="#shop" onClick={close}>{copy.shop}</a>
          <a href="#story" onClick={close}>{copy.story}</a>
          <a href="#why" onClick={close}>{copy.why}</a>
          {session?.authenticated ? <Link href="/profile" onClick={close}>{session.user?.name || 'Profil'}</Link> : <a href="/api/auth/login?returnTo=%2F%23shop">{copy.login}</a>}
          {isAdmin && <Link href="/dashboard" onClick={close}>{copy.dashboard}</Link>}
        </nav>
      </div>
    </>}
  </div>;
}
