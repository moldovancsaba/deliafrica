'use client';

import { Anchor, BodyText, GdsInline, GdsStack, MetadataText, PageTitle, SectionTitle, SimpleGrid } from "@sovereignsquad/gds/client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
const money = (value, currency = 'HUF') => new Intl.NumberFormat('hu-HU', {
  style: 'currency',
  currency
}).format(Number(value) || 0);
const date = value => value ? new Intl.DateTimeFormat('hu-HU', {
  dateStyle: 'medium',
  timeStyle: 'short'
}).format(new Date(value)) : '—';
function Status({
  label,
  value
}) {
  return <GdsStack gap="md"><MetadataText>{label}</MetadataText><br /><span>{value || '—'}</span></GdsStack>;
}
export default function UserHistoryClient({
  ssoUserId
}) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    fetch(`/api/admin/users/${encodeURIComponent(ssoUserId)}`, {
      cache: 'no-store'
    }).then(async res => {
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || 'Betöltési hiba');
      return body;
    }).then(setData).catch(error => setError(error.message));
  }, [ssoUserId]);
  if (error) return <GdsStack gap="md" role="alert">{error}</GdsStack>;
  if (!data) return <BodyText>Betöltés…</BodyText>;
  const {
    user,
    summary,
    profile,
    orders
  } = data;
  return <>
    <GdsInline gap="md"><GdsStack gap="md"><span>CUSTOMER HISTORY</span><PageTitle>{user.name || user.email || 'Felhasználó'}</PageTitle><BodyText>{user.email} · {user.ssoUserId}</BodyText></GdsStack><Anchor href="/dashboard/users">← Vissza a felhasználókhoz</Anchor></GdsInline>

    <SimpleGrid component="section" spacing="md" cols={{
      base: 1,
      md: 2
    }} p="md">
      <GdsStack component="article" gap="md" padding="md"><MetadataText>Rendelések</MetadataText><strong>{summary.orderCount}</strong></GdsStack>
      <GdsStack component="article" gap="md" padding="md"><MetadataText>Összes költés</MetadataText><strong>{money(summary.totalSpent)}</strong></GdsStack>
      <GdsStack component="article" gap="md" padding="md"><MetadataText>Átlagos kosár</MetadataText><strong>{money(summary.averageOrderValue)}</strong></GdsStack>
      <GdsStack component="article" gap="md" padding="md"><MetadataText>Kiszállítva</MetadataText><strong>{summary.deliveredOrders}</strong></GdsStack>
    </SimpleGrid>

    <GdsStack component="section" gap="md" padding="md">
      <SectionTitle order={2}>Fiók és ügyfélprofil</SectionTitle>
      <SimpleGrid spacing="md" cols={{
        base: 1,
        md: 2
      }}>
        <GdsStack gap="md"><BodyText><b>Szerepkör:</b> {user.role}</BodyText><BodyText><b>SSO szerepkör:</b> {user.ssoRole}</BodyText><BodyText><b>SSO státusz:</b> {user.ssoStatus}</BodyText><BodyText><b>Első bejelentkezés:</b> {date(user.firstLoginAt)}</BodyText><BodyText><b>Utolsó bejelentkezés:</b> {date(user.lastLoginAt)}</BodyText><BodyText><b>Utolsó aktivitás:</b> {date(user.lastSeenAt)}</BodyText></GdsStack>
        <GdsStack gap="md"><BodyText><b>Telefonszámok:</b> {profile.phones.join(', ') || '—'}</BodyText><BodyText><b>Címek:</b></BodyText>{profile.addresses.length ? <ul>{profile.addresses.map(address => <li key={address}>{address}</li>)}</ul> : <BodyText>—</BodyText>}<BodyText><b>Adószámok:</b> {profile.taxNumbers.join(', ') || '—'}</BodyText></GdsStack>
      </SimpleGrid>
    </GdsStack>

    <GdsStack component="section" gap="md" padding="md">
      <SectionTitle order={2}>Rendelési előzmények</SectionTitle>
      {orders.length === 0 ? <BodyText>Nincs rendelési előzmény.</BodyText> : orders.map(order => <GdsStack key={order.reference} component="article" gap="md" padding="md">
        <GdsInline gap="md"><GdsStack gap="md"><b>{order.reference}</b><br /><MetadataText>{date(order.createdAt)}</MetadataText></GdsStack><strong>{money(order.total, order.currency || 'HUF')}</strong></GdsInline>
        <GdsStack gap="md"><Status label="Rendelés" value={order.orderStatus} /><Status label="Fizetés" value={order.paymentStatus} /><Status label="Számla" value={order.invoiceStatus} /><Status label="Összekészítés" value={order.fulfilmentStatus} /><Status label="Kiszállítás" value={order.deliveryStatus} /></GdsStack>
        <SimpleGrid spacing="md" cols={{
          base: 1,
          md: 2
        }}>
          <GdsStack gap="md"><SectionTitle order={3}>Termékek</SectionTitle>{order.items.map((item, index) => <BodyText key={`${order.reference}-${item.productId}-${index}`}><b>{item.name}</b> × {item.quantity} · {money(item.unitPrice, order.currency || 'HUF')}</BodyText>)}</GdsStack>
          <GdsStack gap="md"><SectionTitle order={3}>Szállítás / számlázás</SectionTitle><BodyText>{order.customerName}<br />{order.email}<br />{order.phone || ''}<br />{order.address}</BodyText>{order.billingAddress && <BodyText><b>Számlázási cím:</b><br />{order.billingName || order.customerName}<br />{order.billingAddress}</BodyText>}</GdsStack>
        </SimpleGrid>
        <SimpleGrid spacing="md" cols={{
          base: 1,
          md: 2
        }}>
          <GdsStack gap="md"><SectionTitle order={3}>Tranzakciók</SectionTitle><BodyText><b>Fizetve:</b> {date(order.paidAt)}</BodyText><BodyText><b>Transaction ID:</b> {order.paymentTransactionId || '—'}</BodyText><BodyText><b>Számlaszám:</b> {order.invoiceNumber || '—'}</BodyText><BodyText><b>Számlázva:</b> {date(order.invoicedAt)}</BodyText></GdsStack>
          <GdsStack gap="md"><SectionTitle order={3}>Logisztika</SectionTitle><BodyText><b>Packeta pont:</b> {order.packetaPointId || '—'}</BodyText><BodyText><b>Parcel ID:</b> {order.parcelId || '—'}</BodyText><BodyText><b>Tracking:</b> {order.trackingNumber || '—'}</BodyText><BodyText><b>Kézbesítve:</b> {date(order.deliveredAt)}</BodyText></GdsStack>
        </SimpleGrid>
        {(order.customerNote || order.adminNote) && <GdsStack gap="md"><SectionTitle order={3}>Megjegyzések</SectionTitle>{order.customerNote && <BodyText><b>Vásárló:</b> {order.customerNote}</BodyText>}{order.adminNote && <BodyText><b>Admin:</b> {order.adminNote}</BodyText>}</GdsStack>}
        {order.statusHistory?.length > 0 && <GdsStack gap="md"><SectionTitle order={3}>Státusz történet</SectionTitle><GdsStack gap="md">{order.statusHistory.slice().reverse().map((event, index) => <GdsStack key={`${order.reference}-history-${index}`} gap="md"><b>{event.field}</b>: {event.from || '—'} → {event.to}<br /><MetadataText>{date(event.at)} · {event.changedBy || 'system'}{event.note ? ` · ${event.note}` : ''}</MetadataText></GdsStack>)}</GdsStack></GdsStack>}
      </GdsStack>)}
    </GdsStack>
  </>;
}
