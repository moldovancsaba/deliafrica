'use client';

import { BodyText, Button, GdsInline, GdsStack, PageTitle, SectionTitle, TextInput, Textarea, SimpleGrid } from "@sovereignsquad/gds/client";
import { useEffect, useState } from 'react';
const documentOrder = ['gtc', 'terms', 'cookies', 'consumer', 'privacy'];
const documentLabels = {
  gtc: 'GTC / ÁSZF',
  terms: 'T&C / Vásárlási feltételek',
  cookies: 'Süti tájékoztató',
  consumer: 'Fogyasztóvédelmi nyilatkozat',
  privacy: 'GDPR / Adatkezelés'
};
export default function LegalClient() {
  const [legal, setLegal] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  useEffect(() => {
    fetch('/api/site-settings', {
      cache: 'no-store'
    }).then(async r => {
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || 'Nem tölthető be.');
      setLegal(d.legal || {});
    }).catch(e => setError(e.message));
  }, []);
  function setField(path, value) {
    setLegal(current => {
      const next = JSON.parse(JSON.stringify(current));
      let ref = next;
      for (let i = 0; i < path.length - 1; i++) {
        if (!ref[path[i]]) ref[path[i]] = {};
        ref = ref[path[i]];
      }
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
        legal
      })
    });
    const d = await r.json();
    if (!r.ok) {
      setError(d.error || 'Mentési hiba.');
      return;
    }
    setLegal(d.legal || legal);
    setMessage('Jogi és cégadatok mentve.');
  }
  if (!legal) return <GdsStack component="section" gap="md" padding="md">Betöltés…</GdsStack>;
  const company = legal.company || {};
  const banner = legal.cookieBanner || {};
  const docs = legal.documents || {};
  return <>
    <GdsInline gap="md"><GdsStack gap="md"><span>LEGAL · COMPANY · FOOTER</span><PageTitle>Jogi és cégadatok</PageTitle><BodyText>A footer, kapcsolat, közösségi linkek, sütikezelés és minden jogi dokumentum innen szerkeszthető.</BodyText></GdsStack><Button onClick={save} type="button">Minden mentése</Button></GdsInline>
    {message && <GdsStack gap="md" role="status">{message}</GdsStack>}{error && <GdsStack gap="md" role="alert">{error}</GdsStack>}
    <GdsStack component="section" gap="md" padding="md"><SectionTitle order={2}>Cég- és kapcsolati adatok</SectionTitle><SimpleGrid spacing="md" cols={{
        base: 1,
        md: 2
      }}>
      <TextInput value={company.companyName || ''} onChange={e => setField(['company', 'companyName'], e.target.value)} label={<>Cégnév</>} />
      <TextInput value={company.contactName || ''} onChange={e => setField(['company', 'contactName'], e.target.value)} label={<>Kapcsolattartó</>} />
      <TextInput value={company.address || ''} onChange={e => setField(['company', 'address'], e.target.value)} label={<>Cím</>} />
      <TextInput value={company.phone || ''} onChange={e => setField(['company', 'phone'], e.target.value)} label={<>Telefon</>} />
      <TextInput type="email" value={company.email || ''} onChange={e => setField(['company', 'email'], e.target.value)} label={<>E-mail</>} />
      <TextInput value={company.instagram || ''} onChange={e => setField(['company', 'instagram'], e.target.value)} label={<>Instagram megjelenő név</>} />
      <TextInput value={company.instagramUrl || ''} onChange={e => setField(['company', 'instagramUrl'], e.target.value)} label={<>Instagram URL</>} />
      <TextInput value={company.x || ''} onChange={e => setField(['company', 'x'], e.target.value)} label={<>X megjelenő név</>} />
      <TextInput value={company.xUrl || ''} onChange={e => setField(['company', 'xUrl'], e.target.value)} label={<>X URL</>} />
      <TextInput value={company.facebook || ''} onChange={e => setField(['company', 'facebook'], e.target.value)} label={<>Facebook megjelenő név</>} />
      <TextInput value={company.facebookUrl || ''} onChange={e => setField(['company', 'facebookUrl'], e.target.value)} label={<>Facebook URL</>} />
    </SimpleGrid></GdsStack>
    <GdsStack component="section" gap="md" padding="md"><SectionTitle order={2}>Süti hozzájárulási sáv</SectionTitle><SimpleGrid spacing="md" cols={{
        base: 1,
        md: 2
      }}>
      <TextInput value={banner.title || ''} onChange={e => setField(['cookieBanner', 'title'], e.target.value)} label={<>Cím</>} />
      <Textarea value={banner.body || ''} onChange={e => setField(['cookieBanner', 'body'], e.target.value)} label={<>Szöveg</>} />
      <TextInput value={banner.accept || ''} onChange={e => setField(['cookieBanner', 'accept'], e.target.value)} label={<>Elfogadás gomb</>} />
      <TextInput value={banner.reject || ''} onChange={e => setField(['cookieBanner', 'reject'], e.target.value)} label={<>Elutasítás gomb</>} />
      <TextInput value={banner.policyLink || ''} onChange={e => setField(['cookieBanner', 'policyLink'], e.target.value)} label={<>Tájékoztató link szövege</>} />
    </SimpleGrid></GdsStack>
    {documentOrder.map(key => {
      const doc = docs[key] || {};
      return <GdsStack key={key} component="section" gap="md" padding="md"><SectionTitle order={2}>{documentLabels[key]}</SectionTitle><SimpleGrid spacing="md" cols={{
          base: 1,
          md: 2
        }}>
      <TextInput value={doc.title || ''} onChange={e => setField(['documents', key, 'title'], e.target.value)} label={<>Oldalcím</>} />
      <Textarea value={doc.summary || ''} onChange={e => setField(['documents', key, 'summary'], e.target.value)} label={<>Rövid összefoglaló</>} />
      <Textarea value={doc.body || ''} onChange={e => setField(['documents', key, 'body'], e.target.value)} label={<>Teljes szöveg</>} />
    </SimpleGrid></GdsStack>;
    })}
    <GdsStack component="section" gap="md" padding="md"><SectionTitle order={2}>Jogi ellenőrzés</SectionTitle><BodyText>Az alapértelmezett szövegek működő webshop-sablonok, de a konkrét jogi entitás, adószám, cégjegyzék, joghatóság és kötelező fogyasztóvédelmi adatok megadása után érdemes jogi szakértővel felülvizsgáltatni őket.</BodyText></GdsStack>
  </>;
}
