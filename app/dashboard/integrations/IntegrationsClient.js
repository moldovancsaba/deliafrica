'use client';

import { BodyText, Button, Checkbox, GdsInline, GdsStack, PageTitle, SectionTitle, TextInput, SimpleGrid } from "@sovereignsquad/gds/client";
import { useEffect, useState } from 'react';
import GoogleAnalyticsSettings from './GoogleAnalyticsSettings';
const specs = {
  packeta: {
    title: 'Packeta',
    secrets: [['apiKey', 'API key'], ['apiPassword', 'API password']],
    public: [['senderId', 'Sender ID'], ['country', 'Country'], ['language', 'Language']]
  },
  barion: {
    title: 'Barion',
    secrets: [['posKey', 'POS key']],
    public: [['payee', 'Payee e-mail'], ['currency', 'Currency']]
  },
  billingo: {
    title: 'Billingo',
    secrets: [['apiKey', 'API key']],
    public: [['blockId', 'Document block ID'], ['bankAccountId', 'Bank account ID']]
  }
};
export default function IntegrationsClient() {
  const [data, setData] = useState({});
  const [drafts, setDrafts] = useState({});
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  async function load() {
    const r = await fetch('/api/admin/integrations', {
      cache: 'no-store'
    });
    const j = await r.json();
    if (!r.ok) {
      setError(j.error || 'Integrációk nem tölthetők be.');
      return;
    }
    setData(j.integrations || {});
    setDrafts(Object.fromEntries(Object.entries(j.integrations || {}).map(([k, v]) => [k, {
      enabled: v.enabled,
      credentials: {},
      publicConfig: v.publicConfig || {},
      clearFields: []
    }])));
  }
  useEffect(() => {
    load();
  }, []);
  function setField(provider, group, field, value) {
    setDrafts(d => ({
      ...d,
      [provider]: {
        ...d[provider],
        [group]: {
          ...(d[provider]?.[group] || {}),
          [field]: value
        }
      }
    }));
  }
  function toggleClear(provider, field, checked) {
    setDrafts(d => ({
      ...d,
      [provider]: {
        ...d[provider],
        clearFields: checked ? [...(d[provider]?.clearFields || []), field] : (d[provider]?.clearFields || []).filter(v => v !== field)
      }
    }));
  }
  async function save(provider) {
    setMessage('');
    setError('');
    const payload = {
      provider,
      ...drafts[provider]
    };
    const r = await fetch('/api/admin/integrations', {
      method: 'PUT',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    const j = await r.json();
    if (!r.ok) {
      setError(j.error || 'Mentési hiba.');
      return;
    }
    setMessage(`${specs[provider].title} mentve.`);
    await load();
  }
  return <><GdsInline gap="md"><GdsStack gap="md"><span>THIRD-PARTY SERVICES</span><PageTitle>Integrációk</PageTitle><BodyText>A szolgáltatói kulcsok itt állíthatók be. A titkos értékek titkosítva kerülnek MongoDB-be és visszaolvasáskor nem jelennek meg.</BodyText></GdsStack></GdsInline>{message && <GdsStack gap="md" role="status">{message}</GdsStack>}{error && <GdsStack gap="md" role="alert">{error}</GdsStack>}<SimpleGrid spacing="md" cols={{
      base: 1,
      md: 2
    }}><GoogleAnalyticsSettings />{Object.entries(specs).map(([provider, spec]) => {
        const state = data[provider] || {};
        const draft = drafts[provider] || {
          credentials: {},
          publicConfig: {},
          clearFields: []
        };
        return <GdsStack key={provider} component="section" gap="md" padding="md"><SectionTitle order={2}>{spec.title}</SectionTitle><BodyText><span>{draft.enabled ? 'Enabled' : 'Disabled'}</span></BodyText><Checkbox checked={Boolean(draft.enabled)} onChange={e => setDrafts(d => ({
            ...d,
            [provider]: {
              ...d[provider],
              enabled: e.target.checked
            }
          }))} label={<> Integráció engedélyezve</>} /><SectionTitle order={3}>Titkos kulcsok</SectionTitle>{spec.secrets.map(([field, label]) => <GdsStack key={field} gap="md"><TextInput type="password" placeholder={state.configuredFields?.[field] ? 'Beállítva — hagyd üresen a megtartáshoz' : 'Nincs beállítva'} value={draft.credentials?.[field] || ''} onChange={e => setField(provider, 'credentials', field, e.target.value)} label={<>{label}</>} />{state.configuredFields?.[field] && <Checkbox checked={(draft.clearFields || []).includes(field)} onChange={e => toggleClear(provider, field, e.target.checked)} label={<> meglévő kulcs törlése</>} />}</GdsStack>)}<SectionTitle order={3}>Nyilvános konfiguráció</SectionTitle>{spec.public.map(([field, label]) => <TextInput value={draft.publicConfig?.[field] || ''} onChange={e => setField(provider, 'publicConfig', field, e.target.value)} label={<>{label}</>} />)}<Button onClick={() => save(provider)} type="button">{spec.title} mentése</Button></GdsStack>;
      })}</SimpleGrid><GdsStack component="section" gap="md" padding="md"><SectionTitle order={2}>Biztonság</SectionTitle><BodyText>A credential mezők nem kerülnek vissza a böngészőbe. A titkosításhoz a <code>SETTINGS_ENCRYPTION_KEY</code> környezeti változó ajánlott; ha nincs, az alkalmazás a meglévő SSO kliens titkát használja kulcsszármaztatáshoz.</BodyText></GdsStack></>;
}
