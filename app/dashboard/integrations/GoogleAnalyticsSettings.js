'use client';

import { BodyText, Button, Checkbox, GdsStack, SectionTitle, TextInput } from "@sovereignsquad/gds/client";
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
      const response = await fetch('/api/site-settings', {
        cache: 'no-store'
      });
      if (!response.ok) throw new Error('A Google Analytics beállításai nem tölthetők be.');
      const data = await response.json();
      const value = {
        ...DEFAULT_ANALYTICS_SETTINGS,
        ...data.analytics
      };
      setDraft(value);
      setSaved(value);
    } catch {
      setError('A Google Analytics beállításai nem tölthetők be. Próbáld újra.');
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);
  async function save(event) {
    event.preventDefault();
    setError('');
    setMessage('');
    const analytics = {
      ...draft,
      googleAnalyticsMeasurementId: draft.googleAnalyticsMeasurementId.trim().toUpperCase()
    };
    if (analytics.googleAnalyticsEnabled && !analytics.googleAnalyticsMeasurementId || analytics.googleAnalyticsMeasurementId && !/^G-[A-Z0-9]+$/.test(analytics.googleAnalyticsMeasurementId)) {
      setError('Adj meg egy érvényes GA4 Measurement ID-t (G-…).');
      return;
    }
    setSaving(true);
    try {
      const response = await fetch('/api/site-settings', {
        method: 'PUT',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          analytics
        })
      });
      if (!response.ok) throw new Error('save failed');
      const data = await response.json();
      setSaved(data.analytics);
      setDraft(data.analytics);
      setMessage('Google Analytics beállítások mentve.');
      router.refresh();
    } catch {
      setError('A mentés sikertelen. Ellenőrizd a kapcsolatot és az admin jogosultságodat, majd próbáld újra.');
    } finally {
      setSaving(false);
    }
  }
  const configured = saved?.googleAnalyticsEnabled && /^G-[A-Z0-9]+$/.test(saved.googleAnalyticsMeasurementId);
  return <GdsStack id="google-analytics" component="section" gap="md" padding="md">
    <SectionTitle order={2}>Google Analytics</SectionTitle>
    <BodyText>GA4 látogatottságmérés. A mérőkód csak a látogató statisztikai sütihozzájárulása után töltődik be.</BodyText>
    <BodyText><span>{loading ? 'Betöltés…' : !saved ? 'Nem tölthető be' : configured ? 'Engedélyezve és beállítva' : saved.googleAnalyticsEnabled ? 'Measurement ID szükséges' : 'Kikapcsolva'}</span></BodyText>
    <BodyText>A státusz a mentett konfigurációt jelzi, az adatgyűjtést a Google Analytics felületén ellenőrizheted.</BodyText>
    <GdsStack onSubmit={save} component="form" gap="md">
      <GdsStack gap="md">
        <Checkbox disabled={loading || saving || !saved} checked={draft.googleAnalyticsEnabled} onChange={event => setDraft(value => ({
          ...value,
          googleAnalyticsEnabled: event.target.checked
        }))} label={<> Google Analytics engedélyezve</>} />
        <TextInput disabled={loading || saving || !saved} value={draft.googleAnalyticsMeasurementId} placeholder="G-XXXXXXXXXX" maxLength={30} autoCapitalize="characters" spellCheck={false} onChange={event => setDraft(value => ({
          ...value,
          googleAnalyticsMeasurementId: event.target.value
        }))} label={<>GA4 Measurement ID

        </>} />
        <Button type="submit" disabled={loading || saving || !saved} loading={saving}>{saving ? 'Mentés…' : 'Google Analytics mentése'}</Button>
      </GdsStack>
    </GdsStack>
    {message && <GdsStack role="status"><BodyText>{message}</BodyText></GdsStack>}
    {error && <GdsStack role="alert"><BodyText>{error}</BodyText></GdsStack>}
    {!loading && !saved && <Button onClick={load} type="button">Újrapróbálás</Button>}
  </GdsStack>;
}
