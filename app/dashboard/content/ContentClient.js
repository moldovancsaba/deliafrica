'use client';

import { BodyText, Button, GdsInline, GdsStack, PageTitle, SectionTitle, TextInput, Textarea } from "@sovereignsquad/gds/client";
import { useEffect, useMemo, useState } from 'react';
function flatten(value, path = [], out = []) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => flatten(item, [...path, index], out));
  } else if (value && typeof value === 'object') {
    Object.entries(value).forEach(([key, item]) => flatten(item, [...path, key], out));
  } else {
    out.push({
      path,
      value: value ?? ''
    });
  }
  return out;
}
function pathLabel(path) {
  return path.map(part => typeof part === 'number' ? `#${part + 1}` : String(part).replace(/([A-Z])/g, ' $1')).join(' / ');
}
function groupName(path) {
  return String(path[0] || 'general');
}
export default function ContentClient() {
  const [copy, setCopy] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  useEffect(() => {
    fetch('/api/site-settings', {
      cache: 'no-store'
    }).then(r => r.json()).then(d => setCopy(d.uiCopy || {})).catch(() => setError('A tartalom nem tölthető be.'));
  }, []);
  const fields = useMemo(() => copy ? flatten(copy) : [], [copy]);
  const grouped = useMemo(() => fields.reduce((acc, row) => {
    const key = groupName(row.path);
    (acc[key] ||= []).push(row);
    return acc;
  }, {}), [fields]);
  function setValue(path, value) {
    setCopy(current => {
      const next = JSON.parse(JSON.stringify(current));
      let ref = next;
      for (let i = 0; i < path.length - 1; i++) ref = ref[path[i]];
      ref[path.at(-1)] = value;
      return next;
    });
  }
  async function save() {
    setMessage('');
    setError('');
    const r = await fetch('/api/site-settings', {
      method: 'PUT',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        uiCopy: copy
      })
    });
    const d = await r.json();
    if (!r.ok) {
      setError(d.error || 'Mentési hiba.');
      return;
    }
    setMessage('Tartalom mentve.');
    setCopy(d.uiCopy || copy);
  }
  if (!copy) return <GdsStack gap="md" padding="md">Betöltés…</GdsStack>;
  return <><GdsInline gap="md"><GdsStack gap="md"><span>CONTENT MANAGEMENT</span><PageTitle>Tartalom</PageTitle><BodyText>A storefront minden központi UI-szövege változóként, csoportosítva szerkeszthető.</BodyText></GdsStack><Button onClick={save} type="button">Minden módosítás mentése</Button></GdsInline>{message && <GdsStack gap="md" role="status">{message}</GdsStack>}{error && <GdsStack gap="md" role="alert">{error}</GdsStack>}{Object.entries(grouped).map(([group, rows]) => <GdsStack key={group} component="section" gap="md" padding="md"><SectionTitle order={3}>{group}</SectionTitle>{rows.map(row => {
        const key = row.path.join('.');
        const multiline = String(row.value).length > 80 || String(row.value).includes('\n');
        return <GdsStack key={key} component="label" gap="md"><span>{pathLabel(row.path.slice(1)) || group}</span>{multiline ? <Textarea value={row.value} onChange={e => setValue(row.path, e.target.value)} /> : <TextInput value={row.value} onChange={e => setValue(row.path, e.target.value)} />}</GdsStack>;
      })}</GdsStack>)}</>;
}
