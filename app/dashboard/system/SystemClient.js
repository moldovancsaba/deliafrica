'use client';

import { BodyText, Button, GdsInline, GdsStack, MetadataText, PageTitle, SectionTitle, Table, SimpleGrid } from "@sovereignsquad/gds/client";
import { useEffect, useState } from 'react';
const fmt = v => v === undefined || v === null ? '—' : String(v);
export default function SystemClient() {
  const [health, setHealth] = useState(null);
  const [error, setError] = useState('');
  function load() {
    fetch('/api/health', {
      cache: 'no-store'
    }).then(async r => {
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || 'Health API hiba');
      setHealth(d);
      setError('');
    }).catch(e => setError(e.message));
  }
  useEffect(() => {
    load();
    const id = setInterval(load, 15000);
    return () => clearInterval(id);
  }, []);
  return <><GdsInline gap="md"><GdsStack gap="md"><span>SYSTEM HEALTH</span><PageTitle>Rendszer</PageTitle><BodyText>MongoDB, SSO, runtime, API és deployment állapot.</BodyText></GdsStack><Button onClick={load} type="button">Frissítés</Button></GdsInline>{error && <GdsStack gap="md" role="alert">{error}</GdsStack>}<SimpleGrid component="section" spacing="md" cols={{
      base: 1,
      md: 2
    }} p="md"><GdsStack component="article" gap="md" padding="md"><MetadataText>MongoDB</MetadataText><strong>{health?.mongo?.connected ? 'Connected' : 'Unavailable'}</strong></GdsStack><GdsStack component="article" gap="md" padding="md"><MetadataText>SSO</MetadataText><strong>{health?.authentication?.configured ? 'Configured' : 'Missing'}</strong></GdsStack><GdsStack component="article" gap="md" padding="md"><MetadataText>Runtime</MetadataText><strong>{fmt(health?.runtime)}</strong></GdsStack><GdsStack component="article" gap="md" padding="md"><MetadataText>Latency</MetadataText><strong>{health ? `${health.latencyMs} ms` : '…'}</strong></GdsStack></SimpleGrid><GdsStack component="section" gap="md" padding="md"><SectionTitle order={2}>Deployment</SectionTitle><Table><Table.Tbody><Table.Tr><Table.Th>Environment</Table.Th><Table.Td>{fmt(health?.environment)}</Table.Td></Table.Tr><Table.Tr><Table.Th>Region</Table.Th><Table.Td>{fmt(health?.deployment?.region)}</Table.Td></Table.Tr><Table.Tr><Table.Th>Version</Table.Th><Table.Td>{fmt(health?.deployment?.version)}</Table.Td></Table.Tr><Table.Tr><Table.Th>Commit</Table.Th><Table.Td>{fmt(health?.deployment?.commit)}</Table.Td></Table.Tr><Table.Tr><Table.Th>URL</Table.Th><Table.Td>{fmt(health?.deployment?.url)}</Table.Td></Table.Tr><Table.Tr><Table.Th>Socket.io</Table.Th><Table.Td>{fmt(health?.realtime?.status)}</Table.Td></Table.Tr><Table.Tr><Table.Th>Process uptime</Table.Th><Table.Td>{fmt(health?.process?.uptimeSeconds)} s</Table.Td></Table.Tr><Table.Tr><Table.Th>Memory</Table.Th><Table.Td>{fmt(health?.process?.memoryMb)} MB</Table.Td></Table.Tr></Table.Tbody></Table></GdsStack></>;
}
