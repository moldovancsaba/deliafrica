'use client';

import { BodyText, Button, Checkbox, GdsInline, Select, GdsStack, PageTitle, SectionTitle, TextInput, SimpleGrid } from "@sovereignsquad/gds/client";
import { useEffect, useState } from 'react';
export default function StorefrontClient() {
  const [heroMode, setHeroMode] = useState('fixed');
  const [categorySelectorMode, setCategorySelectorMode] = useState('fixed');
  const [sales, setSales] = useState({
    checkoutEnabled: true,
    senderName: 'deli.africa',
    supportEmail: '',
    termsUrl: '/legal/gtc',
    privacyUrl: '/legal/privacy'
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  useEffect(() => {
    fetch('/api/site-settings', {
      cache: 'no-store'
    }).then(r => r.json()).then(d => {
      setHeroMode(d.heroMode || 'fixed');
      setCategorySelectorMode(d.categorySelectorMode || 'fixed');
      setSales(s => ({
        ...s,
        ...(d.sales || {})
      }));
    }).catch(() => setError('A beállítások nem tölthetők be.'));
  }, []);
  async function save() {
    setMessage('');
    setError('');
    const r = await fetch('/api/site-settings', {
      method: 'PUT',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        heroMode,
        categorySelectorMode,
        sales
      })
    });
    const d = await r.json();
    if (!r.ok) {
      setError(d.error || 'Mentési hiba.');
      return;
    }
    setMessage('Megjelenés és rendelési beállítások mentve.');
  }
  return <><GdsInline gap="md"><GdsStack gap="md"><span>STOREFRONT SETTINGS</span><PageTitle>Megjelenés és checkout</PageTitle><BodyText>Hero, kategóriakártyák és a rendelésfelvétel alapbeállításai.</BodyText></GdsStack><Button onClick={save} type="button">Mentés</Button></GdsInline>{message && <GdsStack gap="md" role="status">{message}</GdsStack>}{error && <GdsStack gap="md" role="alert">{error}</GdsStack>}<GdsStack component="section" gap="md" padding="md"><SectionTitle order={2}>Coral bloom</SectionTitle><BodyText>A webshop és az admin felület a közös GDS Coral bloom témát használja.</BodyText><SectionTitle order={2}>Hero megjelenés</SectionTitle><SimpleGrid spacing="md" cols={{
        base: 1,
        md: 2
      }}><Select value={heroMode} onChange={e => setHeroMode(e ?? "")} label={<>Hero mód</>} data={[{
          value: String("fixed"),
          label: "Fix kliensfot\xF3k"
        }, {
          value: String("interactive"),
          label: "Interakt\xEDv term\xE9kkompoz\xEDci\xF3"
        }]} /><Select value={categorySelectorMode} onChange={e => setCategorySelectorMode(e ?? "")} label={<>Kategóriaválasztó</>} data={[{
          value: String("fixed"),
          label: "Fix fot\xF3mont\xE1zs"
        }, {
          value: String("generated"),
          label: "Gener\xE1lt k\xE1rtya"
        }]} /></SimpleGrid></GdsStack><GdsStack component="section" gap="md" padding="md"><SectionTitle order={2}>Rendelési alapbeállítások</SectionTitle><SimpleGrid spacing="md" cols={{
        base: 1,
        md: 2
      }}><Checkbox checked={sales.checkoutEnabled !== false} onChange={e => setSales(s => ({
          ...s,
          checkoutEnabled: e.target.checked
        }))} label={<> Rendelésfelvétel engedélyezve</>} /><TextInput value={sales.senderName || ''} onChange={e => setSales(s => ({
          ...s,
          senderName: e.target.value
        }))} label={<>Feladó neve</>} /><TextInput value={sales.supportEmail || ''} onChange={e => setSales(s => ({
          ...s,
          supportEmail: e.target.value
        }))} label={<>Ügyfélszolgálati e-mail</>} /><TextInput value={sales.termsUrl || ''} onChange={e => setSales(s => ({
          ...s,
          termsUrl: e.target.value
        }))} label={<>ÁSZF URL</>} /><TextInput value={sales.privacyUrl || ''} onChange={e => setSales(s => ({
          ...s,
          privacyUrl: e.target.value
        }))} label={<>Adatkezelési URL</>} /></SimpleGrid></GdsStack></>;
}
