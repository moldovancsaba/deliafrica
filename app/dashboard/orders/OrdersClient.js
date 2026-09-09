'use client';

import { BodyText, Button, GdsInline, Select, GdsStack, MetadataText, PageTitle, SectionTitle, Table, TextInput, Textarea, SimpleGrid } from "@sovereignsquad/gds/client";
import { useEffect, useMemo, useState } from 'react';
const options = {
  orderStatus: ['created', 'bought', 'cancelled', 'refunded'],
  paymentStatus: ['not_started', 'pending', 'paid', 'failed', 'refunded'],
  invoiceStatus: ['not_started', 'pending', 'invoiced', 'failed', 'storno'],
  fulfilmentStatus: ['not_ready', 'picking', 'ready_to_deliver', 'handed_over'],
  deliveryStatus: ['not_started', 'label_created', 'in_transit', 'delivered', 'failed', 'returned']
};
const money = value => new Intl.NumberFormat('hu-HU').format(value || 0) + ' Ft';
export default function OrdersClient() {
  const [orders, setOrders] = useState([]);
  const [selectedRef, setSelectedRef] = useState('');
  const [draft, setDraft] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const selected = useMemo(() => orders.find(o => o.reference === selectedRef), [orders, selectedRef]);
  async function load() {
    const res = await fetch('/api/admin/orders', {
      cache: 'no-store'
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Rendelések nem tölthetők be.');
      return;
    }
    setOrders(data.orders || []);
    if (!selectedRef && data.orders?.length) setSelectedRef(data.orders[0].reference);
  }
  useEffect(() => {
    load();
  }, []);
  useEffect(() => {
    if (selected) setDraft(JSON.parse(JSON.stringify(selected)));
  }, [selected]);
  function setField(field, value) {
    setDraft(d => ({
      ...d,
      [field]: value
    }));
  }
  async function save() {
    setMessage('');
    setError('');
    const res = await fetch('/api/admin/orders', {
      method: 'PUT',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify(draft)
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Mentési hiba.');
      return;
    }
    setMessage('Rendelés frissítve.');
    await load();
    setSelectedRef(data.order.reference);
  }
  return <>
    <GdsInline gap="md"><GdsStack gap="md"><span>ORDER MANAGEMENT</span><PageTitle>Rendelések</PageTitle><BodyText>Vásárlás, fizetés, számla, összekészítés, átadás és kézbesítés teljes életciklusa.</BodyText></GdsStack></GdsInline>
    {message && <GdsStack gap="md" role="status">{message}</GdsStack>}{error && <GdsStack gap="md" role="alert">{error}</GdsStack>}
    <SimpleGrid spacing="md" cols={{
      base: 1,
      md: 2
    }}>
      <GdsStack component="aside" gap="md" padding="md">{orders.map(order => <Button key={order.reference} onClick={() => setSelectedRef(order.reference)} type="button"><b>{order.reference}</b><br /><MetadataText>{order.customerName} · {money(order.total)}</MetadataText><br /><MetadataText>{order.paymentStatus || 'not_started'} · {order.deliveryStatus || 'not_started'}</MetadataText></Button>)}</GdsStack>
      {draft && <GdsStack component="section" gap="md" padding="md">
        <SectionTitle order={2}>{draft.reference}</SectionTitle><BodyText>{new Date(draft.createdAt).toLocaleString('hu-HU')} · {draft.customerName} · {draft.email} · {draft.phone || '—'}</BodyText>
        <SimpleGrid spacing="md" cols={{
          base: 1,
          md: 2
        }}>
          <GdsStack gap="md"><SectionTitle order={3}>Vevő és cím</SectionTitle><SimpleGrid spacing="md" cols={{
              base: 1,
              md: 2
            }}><Textarea value={draft.address || ''} disabled label={<>Szállítási cím</>} /><TextInput value={draft.billingName || ''} onChange={e => setField('billingName', e.target.value)} label={<>Számlázási név</>} /><Textarea value={draft.billingAddress || ''} onChange={e => setField('billingAddress', e.target.value)} label={<>Számlázási cím</>} /><TextInput value={draft.taxNumber || ''} onChange={e => setField('taxNumber', e.target.value)} label={<>Adószám</>} /></SimpleGrid></GdsStack>
          <GdsStack gap="md"><SectionTitle order={3}>Összegzés</SectionTitle><Table><Table.Tbody>{(draft.items || []).map((item, i) => <Table.Tr key={i}><Table.Td>{item.name}</Table.Td><Table.Td>{item.quantity} × {money(item.unitPrice)}</Table.Td></Table.Tr>)}<Table.Tr><Table.Td>Szállítás</Table.Td><Table.Td>{money(draft.shippingFee)}</Table.Td></Table.Tr><Table.Tr><Table.Td>Kedvezmény</Table.Td><Table.Td>-{money(draft.discountTotal)}</Table.Td></Table.Tr><Table.Tr><Table.Th>Összesen</Table.Th><Table.Th>{money(draft.total)}</Table.Th></Table.Tr></Table.Tbody></Table></GdsStack>
        </SimpleGrid>
        <SectionTitle order={3}>Státuszok</SectionTitle><SimpleGrid spacing="md" cols={{
          base: 1,
          md: 2
        }}>
          <Select value={draft.orderStatus || 'created'} onChange={e => setField('orderStatus', e ?? "")} label={<>Vásárlás</>} data={options.orderStatus.map(v => ({
            value: String(v),
            label: String(v)
          }))} />
          <Select value={draft.paymentStatus || 'not_started'} onChange={e => setField('paymentStatus', e ?? "")} label={<>Fizetés</>} data={options.paymentStatus.map(v => ({
            value: String(v),
            label: String(v)
          }))} />
          <Select value={draft.invoiceStatus || 'not_started'} onChange={e => setField('invoiceStatus', e ?? "")} label={<>Számla</>} data={options.invoiceStatus.map(v => ({
            value: String(v),
            label: String(v)
          }))} />
          <Select value={draft.fulfilmentStatus || 'not_ready'} onChange={e => setField('fulfilmentStatus', e ?? "")} label={<>Összekészítés</>} data={options.fulfilmentStatus.map(v => ({
            value: String(v),
            label: String(v)
          }))} />
          <Select value={draft.deliveryStatus || 'not_started'} onChange={e => setField('deliveryStatus', e ?? "")} label={<>Kézbesítés</>} data={options.deliveryStatus.map(v => ({
            value: String(v),
            label: String(v)
          }))} />
          <TextInput value={draft.statusNote || ''} onChange={e => setField('statusNote', e.target.value)} label={<>Státusz megjegyzés</>} />
        </SimpleGrid>
        <SectionTitle order={3}>Fizetés és számlázás</SectionTitle><SimpleGrid spacing="md" cols={{
          base: 1,
          md: 2
        }}><TextInput value={draft.paymentTransactionId || ''} onChange={e => setField('paymentTransactionId', e.target.value)} label={<>Barion tranzakció ID</>} /><TextInput value={draft.invoiceNumber || ''} onChange={e => setField('invoiceNumber', e.target.value)} label={<>Számlaszám</>} /><TextInput value={draft.invoiceUrl || ''} onChange={e => setField('invoiceUrl', e.target.value)} label={<>Számla URL</>} /></SimpleGrid>
        <SectionTitle order={3}>Szállítás / Packeta</SectionTitle><SimpleGrid spacing="md" cols={{
          base: 1,
          md: 2
        }}><TextInput value={draft.packetaPointId || ''} onChange={e => setField('packetaPointId', e.target.value)} label={<>Packeta pont ID</>} /><TextInput value={draft.parcelId || ''} onChange={e => setField('parcelId', e.target.value)} label={<>Parcel ID</>} /><TextInput value={draft.trackingNumber || ''} onChange={e => setField('trackingNumber', e.target.value)} label={<>Tracking szám</>} /><TextInput value={draft.trackingUrl || ''} onChange={e => setField('trackingUrl', e.target.value)} label={<>Tracking URL</>} /></SimpleGrid>
        <SectionTitle order={3}>Admin megjegyzés</SectionTitle><Textarea value={draft.adminNote || ''} onChange={e => setField('adminNote', e.target.value)} />
        <GdsInline gap="md"><Button onClick={save} type="button">Rendelés mentése</Button></GdsInline>
        <SectionTitle order={3}>Státusztörténet</SectionTitle><GdsStack gap="md">{(draft.statusHistory || []).slice().reverse().map((row, i) => <GdsStack key={i} gap="md"><b>{row.field}: {row.from || '—'} → {row.to}</b><br /><MetadataText>{new Date(row.at).toLocaleString('hu-HU')} · {row.changedBy || 'system'} {row.note ? `· ${row.note}` : ''}</MetadataText></GdsStack>)}</GdsStack>
      </GdsStack>}
    </SimpleGrid>
  </>;
}
