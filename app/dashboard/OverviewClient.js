'use client';

import { Anchor, BodyText, GdsInline, GdsStack, MetadataText, PageTitle, SectionTitle, SimpleGrid } from "@sovereignsquad/gds/client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
export default function OverviewClient() {
  const [health, setHealth] = useState(null);
  const [users, setUsers] = useState(null);
  useEffect(() => {
    const load = () => fetch('/api/health', {
      cache: 'no-store'
    }).then(r => r.json()).then(setHealth).catch(() => {});
    const loadUsers = () => fetch('/api/admin/users', {
      cache: 'no-store'
    }).then(r => r.ok ? r.json() : null).then(data => data && setUsers(data.users || [])).catch(() => {});
    load();
    loadUsers();
    const timer = setInterval(load, 15000);
    return () => clearInterval(timer);
  }, []);
  const orderCount = health?.orders?.available ? health.orders.total : '—';
  const openCount = health?.orders?.available ? health.orders.open : '—';
  const adminCount = users ? users.filter(user => user.role === 'admin').length : '—';
  return <>
    <GdsInline gap="md"><GdsStack gap="md"><span>GENERAL DASHBOARD</span><PageTitle>Áttekintés</PageTitle><BodyText>Rendszerállapot, értékesítés, felhasználók és admin navigáció egy helyen.</BodyText></GdsStack></GdsInline>
    <SimpleGrid component="section" spacing="md" cols={{
      base: 1,
      md: 2
    }} p="md">
      <GdsStack component="article" gap="md" padding="md"><MetadataText>MongoDB</MetadataText><strong>{health?.mongo?.connected ? 'Connected' : 'Unavailable'}</strong></GdsStack>
      <GdsStack component="article" gap="md" padding="md"><MetadataText>Regisztrált felhasználók</MetadataText><strong>{users ? users.length : '—'}</strong></GdsStack>
      <GdsStack component="article" gap="md" padding="md"><MetadataText>Adminok</MetadataText><strong>{adminCount}</strong></GdsStack>
      <GdsStack component="article" gap="md" padding="md"><MetadataText>Összes rendelés</MetadataText><strong>{orderCount}</strong></GdsStack>
      <GdsStack component="article" gap="md" padding="md"><MetadataText>Nyitott rendelés</MetadataText><strong>{openCount}</strong></GdsStack>
      <GdsStack component="article" gap="md" padding="md"><MetadataText>Health latency</MetadataText><strong>{health ? `${health.latencyMs} ms` : '…'}</strong></GdsStack>
    </SimpleGrid>
    <GdsStack component="section" gap="md" padding="md"><SectionTitle order={2}>Admin területek</SectionTitle><SimpleGrid spacing="md" cols={{
        base: 1,
        md: 2
      }}>
      <Anchor href="/dashboard/users"><MetadataText>Accounts</MetadataText><strong>Felhasználók</strong><BodyText>Regisztrált fiókok, rendelések és admin jogosultságok.</BodyText></Anchor>
      <Anchor href="/dashboard/products"><MetadataText>Katalógus</MetadataText><strong>Termékek</strong><BodyText>CRUD, készlet, ár, méret, parcel adatok.</BodyText></Anchor>
      <Anchor href="/dashboard/orders"><MetadataText>Sales</MetadataText><strong>Rendelések</strong><BodyText>Fizetés, számla, fulfilment, delivery státuszok.</BodyText></Anchor>
      <Anchor href="/dashboard/integrations"><MetadataText>Providers</MetadataText><strong>Integrációk</strong><BodyText>Packeta, Barion, Billingo kulcsok és állapot.</BodyText></Anchor>
      <Anchor href="/dashboard/content"><MetadataText>CMS</MetadataText><strong>Tartalom</strong><BodyText>Minden storefront szöveg szerkesztése.</BodyText></Anchor>
    </SimpleGrid></GdsStack>
  </>;
}
