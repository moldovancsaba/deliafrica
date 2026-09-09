'use client';

import { Anchor, BodyText, Button, GdsInline, GdsStack, MetadataText, PageTitle, SectionTitle, TextInput, Textarea, SimpleGrid } from "@sovereignsquad/gds/client";
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import BrandLogo from '@/app/components/BrandLogo';
import { DEFAULT_STOREFRONT_UI_COPY } from '@/lib/storefront-copy';
const empty = {
  name: '',
  email: '',
  phone: '',
  shippingAddress: {
    recipientName: '',
    phone: '',
    country: '',
    postalCode: '',
    city: '',
    addressLine1: '',
    addressLine2: '',
    deliveryNote: ''
  },
  billingDetails: {
    billingName: '',
    companyName: '',
    taxNumber: '',
    country: '',
    postalCode: '',
    city: '',
    addressLine1: '',
    addressLine2: ''
  }
};
function money(value, currency = 'HUF') {
  return new Intl.NumberFormat('hu-HU', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0
  }).format(Number(value) || 0);
}
function date(value) {
  if (!value) return '—';
  try {
    return new Intl.DateTimeFormat('hu-HU', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(new Date(value));
  } catch {
    return '—';
  }
}
export default function ProfileClient() {
  const [profile, setProfile] = useState(empty);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [uiCopy, setUiCopy] = useState(DEFAULT_STOREFRONT_UI_COPY);
  const copy = uiCopy.profile;
  const statuses = uiCopy.orderStatus;
  async function load() {
    setLoading(true);
    setError('');
    const [profileRes, settingsRes] = await Promise.all([fetch('/api/profile', {
      cache: 'no-store'
    }), fetch('/api/site-settings', {
      cache: 'no-store'
    }).catch(() => null)]);
    let resolvedCopy = uiCopy;
    if (settingsRes?.ok) {
      const settings = await settingsRes.json().catch(() => ({}));
      if (settings.uiCopy) {
        resolvedCopy = settings.uiCopy;
        setUiCopy(settings.uiCopy);
      }
    }
    const data = await profileRes.json().catch(() => ({}));
    if (!profileRes.ok) setError(data.error || resolvedCopy.profile.loadError);else {
      const defaultCountry = resolvedCopy.profile.defaultCountry || '';
      setProfile({
        ...empty,
        ...(data.profile || {}),
        shippingAddress: {
          ...empty.shippingAddress,
          country: defaultCountry,
          ...(data.profile?.shippingAddress || {})
        },
        billingDetails: {
          ...empty.billingDetails,
          country: defaultCountry,
          ...(data.profile?.billingDetails || {})
        }
      });
      setOrders(data.orders || []);
    }
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);
  function setField(section, key, value) {
    if (!section) return setProfile(current => ({
      ...current,
      [key]: value
    }));
    setProfile(current => ({
      ...current,
      [section]: {
        ...current[section],
        [key]: value
      }
    }));
  }
  function copyShippingToBilling() {
    const s = profile.shippingAddress;
    setProfile(current => ({
      ...current,
      billingDetails: {
        ...current.billingDetails,
        billingName: current.billingDetails.billingName || s.recipientName,
        country: s.country,
        postalCode: s.postalCode,
        city: s.city,
        addressLine1: s.addressLine1,
        addressLine2: s.addressLine2
      }
    }));
  }
  async function save(event) {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');
    const res = await fetch('/api/profile', {
      method: 'PUT',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify(profile)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) setError(data.error || copy.saveError);else setMessage(copy.saveSuccess);
    setSaving(false);
  }
  const totalSpent = useMemo(() => orders.reduce((sum, order) => sum + (Number(order.total) || 0), 0), [orders]);
  if (loading) return <GdsStack component="main" gap="md" padding="md"><GdsStack gap="md">{copy.loading}</GdsStack></GdsStack>;
  return <GdsStack component="main" gap="md" padding="md">
    <GdsInline component="header" gap="md" padding="md"><Anchor href="/" aria-label={uiCopy.accessibility?.home}><BrandLogo /></Anchor><GdsInline gap="md"><Anchor href="/">{copy.backToShop}</Anchor><Anchor href="/api/auth/logout">{copy.logout}</Anchor></GdsInline></GdsInline>
    <SimpleGrid component="section" spacing="md" cols={{
      base: 1,
      md: 2
    }} p="md"><span>{copy.eyebrow}</span><PageTitle>{copy.title}</PageTitle><BodyText>{profile.name || copy.customerFallback} · {profile.email}</BodyText></SimpleGrid>
    {message && <GdsStack gap="md" role="status">{message}</GdsStack>}{error && <GdsStack gap="md" role="alert">{error}</GdsStack>}
    <GdsStack component="section" gap="md" padding="md"><GdsStack component="article" gap="md" padding="md"><MetadataText>{copy.statsOrders}</MetadataText><strong>{orders.length}</strong></GdsStack><GdsStack component="article" gap="md" padding="md"><MetadataText>{copy.statsSpent}</MetadataText><strong>{money(totalSpent)}</strong></GdsStack><GdsStack component="article" gap="md" padding="md"><MetadataText>{copy.statsLastOrder}</MetadataText><strong>{orders[0] ? date(orders[0].createdAt) : '—'}</strong></GdsStack></GdsStack>
    <GdsStack onSubmit={save} component="form" gap="md">
      <GdsStack component="section" gap="md" padding="md"><GdsInline gap="md" padding="md"><GdsStack gap="md"><span>{copy.contactEyebrow}</span><SectionTitle order={2}>{copy.contactTitle}</SectionTitle></GdsStack></GdsInline><SimpleGrid spacing="md" cols={{
          base: 1,
          md: 2
        }}><TextInput value={profile.name || ''} disabled label={<>{copy.name}</>} /><TextInput value={profile.email || ''} disabled label={<>{copy.email}</>} /><TextInput value={profile.phone || ''} onChange={e => setField(null, 'phone', e.target.value)} placeholder={copy.phonePlaceholder} label={<>{copy.phone}</>} /></SimpleGrid></GdsStack>
      <GdsStack component="section" gap="md" padding="md"><GdsInline gap="md" padding="md"><GdsStack gap="md"><span>{copy.shippingEyebrow}</span><SectionTitle order={2}>{copy.shippingTitle}</SectionTitle></GdsStack><MetadataText>{copy.shippingHelp}</MetadataText></GdsInline><SimpleGrid spacing="md" cols={{
          base: 1,
          md: 2
        }}><TextInput value={profile.shippingAddress.recipientName} onChange={e => setField('shippingAddress', 'recipientName', e.target.value)} label={<>{copy.recipientName}</>} /><TextInput value={profile.shippingAddress.phone} onChange={e => setField('shippingAddress', 'phone', e.target.value)} label={<>{copy.phone}</>} /><TextInput value={profile.shippingAddress.country} onChange={e => setField('shippingAddress', 'country', e.target.value)} label={<>{copy.country}</>} /><TextInput value={profile.shippingAddress.postalCode} onChange={e => setField('shippingAddress', 'postalCode', e.target.value)} label={<>{copy.postalCode}</>} /><TextInput value={profile.shippingAddress.city} onChange={e => setField('shippingAddress', 'city', e.target.value)} label={<>{copy.city}</>} /><TextInput value={profile.shippingAddress.addressLine1} onChange={e => setField('shippingAddress', 'addressLine1', e.target.value)} placeholder={copy.addressPlaceholder} label={<>{copy.address}</>} /><TextInput value={profile.shippingAddress.addressLine2} onChange={e => setField('shippingAddress', 'addressLine2', e.target.value)} placeholder={copy.address2Placeholder} label={<>{copy.address2}</>} /><Textarea value={profile.shippingAddress.deliveryNote} onChange={e => setField('shippingAddress', 'deliveryNote', e.target.value)} label={<>{copy.deliveryNote}</>} /></SimpleGrid></GdsStack>
      <GdsStack component="section" gap="md" padding="md"><GdsInline gap="md" padding="md"><GdsStack gap="md"><span>{copy.billingEyebrow}</span><SectionTitle order={2}>{copy.billingTitle}</SectionTitle></GdsStack><Button type="button" onClick={copyShippingToBilling}>{copy.copyShipping}</Button></GdsInline><SimpleGrid spacing="md" cols={{
          base: 1,
          md: 2
        }}><TextInput value={profile.billingDetails.billingName} onChange={e => setField('billingDetails', 'billingName', e.target.value)} label={<>{copy.billingName}</>} /><TextInput value={profile.billingDetails.companyName} onChange={e => setField('billingDetails', 'companyName', e.target.value)} label={<>{copy.companyName}</>} /><TextInput value={profile.billingDetails.taxNumber} onChange={e => setField('billingDetails', 'taxNumber', e.target.value)} label={<>{copy.taxNumber}</>} /><TextInput value={profile.billingDetails.country} onChange={e => setField('billingDetails', 'country', e.target.value)} label={<>{copy.country}</>} /><TextInput value={profile.billingDetails.postalCode} onChange={e => setField('billingDetails', 'postalCode', e.target.value)} label={<>{copy.postalCode}</>} /><TextInput value={profile.billingDetails.city} onChange={e => setField('billingDetails', 'city', e.target.value)} label={<>{copy.city}</>} /><TextInput value={profile.billingDetails.addressLine1} onChange={e => setField('billingDetails', 'addressLine1', e.target.value)} label={<>{copy.billingAddress}</>} /><TextInput value={profile.billingDetails.addressLine2} onChange={e => setField('billingDetails', 'addressLine2', e.target.value)} label={<>{copy.billingAddress2}</>} /></SimpleGrid></GdsStack>
      <GdsStack gap="md"><Button disabled={saving} type="submit">{saving ? copy.saving : copy.save}</Button></GdsStack>
    </GdsStack>
    <GdsStack component="section" gap="md" padding="md"><GdsInline gap="md" padding="md"><GdsStack gap="md"><span>{copy.historyEyebrow}</span><SectionTitle order={2}>{copy.historyTitle}</SectionTitle></GdsStack></GdsInline>{orders.length === 0 ? <BodyText>{copy.noOrders}</BodyText> : <GdsStack gap="md">{orders.map(order => <GdsStack key={order.reference} component="article" gap="md" padding="md"><GdsStack gap="md"><b>{order.reference}</b><MetadataText>{date(order.createdAt)}</MetadataText></GdsStack><GdsStack gap="md"><span>{order.items?.map(item => `${item.name} × ${item.quantity}`).join(', ')}</span><MetadataText>{copy.paymentLabel}: {statuses.payment?.[order.paymentStatus] || order.paymentStatus} · {copy.deliveryLabel}: {statuses.delivery?.[order.deliveryStatus] || order.deliveryStatus}</MetadataText></GdsStack><strong>{money(order.total, order.currency || 'HUF')}</strong>{order.trackingUrl && <Anchor href={order.trackingUrl} target="_blank" rel="noreferrer">{copy.tracking}</Anchor>}</GdsStack>)}</GdsStack>}</GdsStack>
  </GdsStack>;
}
