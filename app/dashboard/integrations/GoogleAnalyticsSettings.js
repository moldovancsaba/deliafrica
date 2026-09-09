'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DEFAULT_ANALYTICS_SETTINGS } from '@/lib/site-config';

export default function GoogleAnalyticsSettings() {
  const router = useRouter();
  const [draft, setDraft] = useState(DEFAULT_ANALYTICS_SETTINGS);
  const [saved, setSaved] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/site-settings', { cache: 'no-store' });
      if (!response.ok) throw new Error('A Google Analytics beállításai nem tölthetők be.');
      const data = await response.json();
      const value = { ...DEFAULT_ANALYTICS_SETTINGS, ...data.analytics };
      setDraft(value);
      setSaved(value);
    } catch {
      setError('A Google Analytics beállításai nem tölthetők be. Próbáld újra.');
    } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function save(event) {
    event.preventDefault();
    setError('');
    setMessage('');
    const analytics = { ...draft, googleAnalyticsMeasurementId: draft.googleAnalyticsMeasurementId.trim().toUpperCase() };
    if ((analytics.googleAnalyticsEnabled && !analytics.googleAnalyticsMeasurementId) ||
        (analytics.googleAnalyticsMeasurementId && !/^G-[A-Z0-9]+$/.test(analytics.googleAnalyticsMeasurementId))) {
      setError('Adj meg egy érvényes GA4 Measurement ID-t (G-…).');
      return;
    }
    setSaving(true);
    try {
      const response = await fetch('/api/site-settings', {
        method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ analytics })
      });
      if (!response.ok) throw new Error('save failed');
      const data = await response.json();
      setSaved(data.analytics);
      setDraft(data.analytics);
      setMessage('Google Analytics beállítások mentve.');
      router.refresh();
    } catch {
      setError('A mentés sikertelen. Ellenőrizd a kapcsolatot és az admin jogosultságodat, majd próbáld újra.');
    } finally { setSaving(false); }
  }

  const configured = saved?.googleAnalyticsEnabled && /^G-[A-Z0-9]+$/.test(saved.googleAnalyticsMeasurementId);
  return <section className="integration-card" id="google-analytics">
    <h2>Google Analytics</h2>
    <p>GA4 látogatottságmérés. A mérőkód csak a látogató statisztikai sütihozzájárulása után töltődik be.</p>
    <p><span className={`status-pill ${configured ? 'ok' : 'warn'}`}>{loading ? 'Betöltés…' : !saved ? 'Nem tölthető be' : configured ? 'Engedélyezve és beállítva' : saved.googleAnalyticsEnabled ? 'Measurement ID szükséges' : 'Kikapcsolva'}</span></p>
    <p>A státusz a mentett konfigurációt jelzi, az adatgyűjtést a Google Analytics felületén ellenőrizheted.</p>
    <form onSubmit={save}>
      <fieldset disabled={loading || saving || !saved} style={{ border: 0, padding: 0, margin: 0 }}>
        <label><input type="checkbox" checked={draft.googleAnalyticsEnabled} onChange={event => setDraft(value => ({ ...value, googleAnalyticsEnabled: event.target.checked }))} /> Google Analytics engedélyezve</label>
        <label style={{ display: 'block', margin: '16px 0' }}>GA4 Measurement ID
          <input style={{ width: '100%', padding: 10 }} value={draft.googleAnalyticsMeasurementId} placeholder="G-XXXXXXXXXX" maxLength={30} autoCapitalize="characters" spellCheck={false} onChange={event => setDraft(value => ({ ...value, googleAnalyticsMeasurementId: event.target.value }))} />
        </label>
        <button className="admin-button red" type="submit">{saving ? 'Mentés…' : 'Google Analytics mentése'}</button>
      </fieldset>
    </form>
    {message && <p role="status" className="admin-message">{message}</p>}
    {error && <p role="alert" className="admin-error">{error}</p>}
    {!loading && !saved && <button className="admin-button" onClick={load}>Újrapróbálás</button>}
  </section>;
}
