'use client';

import { ConfirmDialog, Anchor, BodyText, Button, GdsInline, GdsStack, MetadataText, PageTitle, Table, TextInput, SimpleGrid } from "@sovereignsquad/gds/client";
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
function money(value) {
  return `${new Intl.NumberFormat('hu-HU').format(Number(value) || 0)} Ft`;
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
export default function UsersClient() {
  const [roleRequest, setRoleRequest] = useState(null);
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  async function load() {
    setLoading(true);
    setError('');
    const res = await fetch('/api/admin/users', {
      cache: 'no-store'
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) setError(data.error || 'Nem sikerült betölteni a felhasználókat.');else setUsers(data.users || []);
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return users;
    return users.filter(user => [user.name, user.email, user.ssoUserId, user.role].some(value => String(value || '').toLowerCase().includes(needle)));
  }, [users, query]);
  const admins = users.filter(user => user.role === 'admin').length;
  const buyers = users.filter(user => user.orderCount > 0).length;
  async function setRole(user, role, confirmed = false) {
    if (user.role === role) return;
    const action = role === 'admin' ? 'admin jogosultságot adsz' : 'visszavonod az admin jogosultságot';
    if (!confirmed) {
      setRoleRequest({
        user,
        role,
        action
      });
      return;
    }
    setRoleRequest(null);
    setSaving(user.ssoUserId);
    setError('');
    setMessage('');
    const res = await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        ssoUserId: user.ssoUserId,
        role
      })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) setError(data.error || 'A jogosultság módosítása sikertelen.');else {
      setMessage(role === 'admin' ? 'Admin jogosultság megadva.' : 'Admin jogosultság visszavonva.');
      await load();
    }
    setSaving('');
  }
  return <><ConfirmDialog opened={Boolean(roleRequest)} onClose={() => setRoleRequest(null)} onConfirm={() => setRole(roleRequest.user, roleRequest.role, true)} title="Jogosultság módosítása"><BodyText>{roleRequest?.action}: {roleRequest?.user.email}</BodyText></ConfirmDialog>
    <GdsInline gap="md"><GdsStack gap="md"><span>USER MANAGEMENT</span><PageTitle>Felhasználók</PageTitle><BodyText>Regisztrált vásárlók, aktivitás, teljes rendelési előzmény és admin jogosultságok.</BodyText></GdsStack></GdsInline>
    <SimpleGrid component="section" spacing="md" cols={{
      base: 1,
      md: 2
    }} p="md">
      <GdsStack component="article" gap="md" padding="md"><MetadataText>Regisztrált felhasználó</MetadataText><strong>{users.length}</strong></GdsStack>
      <GdsStack component="article" gap="md" padding="md"><MetadataText>Admin</MetadataText><strong>{admins}</strong></GdsStack>
      <GdsStack component="article" gap="md" padding="md"><MetadataText>Vásárló rendelésekkel</MetadataText><strong>{buyers}</strong></GdsStack>
      <GdsStack component="article" gap="md" padding="md"><MetadataText>Összes rendelés</MetadataText><strong>{users.reduce((sum, u) => sum + (u.orderCount || 0), 0)}</strong></GdsStack>
    </SimpleGrid>
    <GdsStack component="section" gap="md" padding="md">
      <GdsInline gap="md"><TextInput placeholder="Keresés név, e-mail, SSO ID vagy szerepkör alapján" value={query} onChange={e => setQuery(e.target.value)} /><Button onClick={load} type="button" variant="default">Frissítés</Button></GdsInline>
      {message && <GdsStack gap="md" role="status">{message}</GdsStack>}{error && <GdsStack gap="md" role="alert">{error}</GdsStack>}
      {loading ? <BodyText>Betöltés…</BodyText> : <GdsStack gap="md"><Table><Table.Thead><Table.Tr><Table.Th>Felhasználó</Table.Th><Table.Th>Szerepkör</Table.Th><Table.Th>Regisztráció / aktivitás</Table.Th><Table.Th>Rendelések</Table.Th><Table.Th>Jogosultság</Table.Th></Table.Tr></Table.Thead><Table.Tbody>
        {filtered.map(user => <Table.Tr key={user.ssoUserId}>
          <Table.Td><Anchor href={`/dashboard/users/${encodeURIComponent(user.ssoUserId)}`}><b>{user.name || 'Névtelen felhasználó'}</b></Anchor><br /><span>{user.email || 'Nincs e-mail'}</span><br /><MetadataText>{user.ssoUserId}</MetadataText>{user.isCurrentUser && <><br /><span>Te</span></>}</Table.Td>
          <Table.Td><span>{user.role}</span>{user.roleOverride && <><br /><MetadataText>helyi override · SSO: {user.ssoRole}</MetadataText></>}</Table.Td>
          <Table.Td><MetadataText>Első: {date(user.firstLoginAt)}</MetadataText><br /><MetadataText>Utolsó login: {date(user.lastLoginAt)}</MetadataText><br /><MetadataText>Utolsó aktivitás: {date(user.lastSeenAt)}</MetadataText></Table.Td>
          <Table.Td><b>{user.orderCount || 0} db</b><br /><MetadataText>{money(user.totalSpent)}</MetadataText><br /><MetadataText>{user.lastOrderAt ? `Utolsó: ${date(user.lastOrderAt)}` : 'Nincs rendelés'}</MetadataText><br /><Anchor href={`/dashboard/users/${encodeURIComponent(user.ssoUserId)}`}>Teljes előzmény →</Anchor></Table.Td>
          <Table.Td>{user.role === 'admin' ? <Button disabled={saving === user.ssoUserId || user.isCurrentUser} onClick={() => setRole(user, 'user')} type="button" variant="default">{user.isCurrentUser ? 'Saját admin jog' : 'Admin jog visszavonása'}</Button> : <Button disabled={saving === user.ssoUserId} onClick={() => setRole(user, 'admin')} type="button">Admin jog megadása</Button>}</Table.Td>
        </Table.Tr>)}
      </Table.Tbody></Table></GdsStack>}
      {!loading && filtered.length === 0 && <BodyText>Nincs találat.</BodyText>}
    </GdsStack>
  </>;
}
