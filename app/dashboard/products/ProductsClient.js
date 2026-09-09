'use client';

import { ConfirmDialog, BodyText, Button, Checkbox, GdsInline, Select, GdsStack, MetadataText, PageTitle, SectionTitle, TextInput, Textarea, SimpleGrid } from "@sovereignsquad/gds/client";
import { useEffect, useMemo, useState } from 'react';
const emptyProduct = {
  id: '',
  slug: '',
  sku: '',
  barcode: '',
  name: '',
  subtitle: '',
  category: 'braai',
  categoryName: '',
  badge: '',
  tone: 'red',
  visual: '',
  image: '',
  heroImage: '',
  editorialImage: '',
  editorialCaption: '',
  price: '',
  currency: 'HUF',
  vatRate: 27,
  active: true,
  purchasable: true,
  story: '',
  whatItIs: '',
  background: '',
  flavour: '',
  audience: '',
  packaging: '',
  info: '',
  originCountry: 'South Africa',
  brand: '',
  ingredients: '',
  allergens: '',
  storage: '',
  nutrition: '',
  pairings: [],
  servingIdeas: [],
  faq: [],
  seo: {
    title: '',
    description: '',
    aiSummary: '',
    ogTitle: '',
    ogDescription: ''
  },
  dimensions: {
    widthMm: 0,
    heightMm: 0,
    depthMm: 0,
    weightG: 0
  },
  parcel: {
    widthMm: 0,
    heightMm: 0,
    depthMm: 0,
    weightG: 0,
    unitsPerParcel: 1
  },
  inventory: {
    stockQty: 0,
    reservedQty: 0,
    lowStockThreshold: 3,
    trackInventory: true
  }
};
const categoryOptions = ['braai', 'spices', 'pate', 'tea', 'snacks', 'pantry'];
const n = value => Number.isFinite(Number(value)) ? Number(value) : 0;
export default function ProductsClient() {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [draft, setDraft] = useState(emptyProduct);
  const [mode, setMode] = useState('edit');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const selected = useMemo(() => products.find(p => p.id === selectedId), [products, selectedId]);
  async function load() {
    setError('');
    const res = await fetch('/api/admin/products', {
      cache: 'no-store'
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Nem sikerült betölteni a termékeket.');
      return;
    }
    setProducts(data.products || []);
    if (!selectedId && data.products?.length) setSelectedId(data.products[0].id);
  }
  useEffect(() => {
    load();
  }, []);
  useEffect(() => {
    if (selected) {
      setDraft({
        ...JSON.parse(JSON.stringify(emptyProduct)),
        ...JSON.parse(JSON.stringify(selected)),
        seo: {
          ...emptyProduct.seo,
          ...(selected.seo || {})
        },
        faq: selected.faq || []
      });
      setMode('edit');
    }
  }, [selected]);
  function setField(path, value) {
    setDraft(current => {
      const next = JSON.parse(JSON.stringify(current));
      const parts = path.split('.');
      let ref = next;
      for (let i = 0; i < parts.length - 1; i++) {
        if (ref[parts[i]] == null) ref[parts[i]] = {};
        ref = ref[parts[i]];
      }
      ref[parts.at(-1)] = value;
      return next;
    });
  }
  function newProduct() {
    setMode('new');
    setSelectedId('');
    setDraft(JSON.parse(JSON.stringify(emptyProduct)));
    setMessage('');
    setError('');
  }
  function faqText() {
    return (draft.faq || []).map(item => `${item.question}\t${item.answer}`).join('\n');
  }
  function setFaq(value) {
    setField('faq', String(value || '').split('\n').map(row => {
      const [question, ...rest] = row.split('\t');
      return {
        question: (question || '').trim(),
        answer: rest.join('\t').trim()
      };
    }).filter(item => item.question || item.answer));
  }
  async function save(event) {
    event.preventDefault();
    setMessage('');
    setError('');
    const payload = {
      ...draft,
      price: draft.price === '' ? null : n(draft.price),
      vatRate: n(draft.vatRate),
      dimensions: Object.fromEntries(Object.entries(draft.dimensions || {}).map(([k, v]) => [k, n(v)])),
      parcel: Object.fromEntries(Object.entries(draft.parcel || {}).map(([k, v]) => [k, n(v)])),
      inventory: {
        ...draft.inventory,
        stockQty: n(draft.inventory?.stockQty),
        reservedQty: n(draft.inventory?.reservedQty),
        lowStockThreshold: n(draft.inventory?.lowStockThreshold)
      },
      pairings: Array.isArray(draft.pairings) ? draft.pairings : String(draft.pairings || '').split('\n').map(v => v.trim()).filter(Boolean),
      servingIdeas: Array.isArray(draft.servingIdeas) ? draft.servingIdeas : String(draft.servingIdeas || '').split('\n').map(v => v.trim()).filter(Boolean)
    };
    const res = await fetch('/api/admin/products', {
      method: mode === 'new' ? 'POST' : 'PUT',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Mentési hiba.');
      return;
    }
    setMessage('Termék mentve.');
    await load();
    setSelectedId(data.product.id);
  }
  async function remove() {
    if (!draft.id) return;
    setDeleteOpen(false);
    const res = await fetch('/api/admin/products', {
      method: 'DELETE',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        id: draft.id
      })
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Törlési hiba.');
      return;
    }
    setMessage('Termék törölve.');
    setSelectedId('');
    setDraft(emptyProduct);
    await load();
  }
  return <><ConfirmDialog opened={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={remove} title="Termék törlése"><BodyText>{draft.name}</BodyText></ConfirmDialog>
    <GdsInline gap="md"><GdsStack gap="md"><span>PRODUCT CATALOGUE</span><PageTitle>Termékek</PageTitle><BodyText>Teljes CRUD: kereskedelmi adatok, készlet, logisztika, storefront/PDP tartalom és SEO/AI mezők.</BodyText></GdsStack><Button onClick={newProduct} type="button">+ Új termék</Button></GdsInline>
    {message && <GdsStack gap="md" role="status">{message}</GdsStack>}{error && <GdsStack gap="md" role="alert">{error}</GdsStack>}
    <SimpleGrid spacing="md" cols={{
      base: 1,
      md: 2
    }}><GdsStack component="aside" gap="md" padding="md">{products.map(product => <Button key={product.id} onClick={() => setSelectedId(product.id)} type="button"><b>{product.name}</b><br /><MetadataText>{product.sku || product.id} · készlet: {product.inventory?.stockQty ?? 0}</MetadataText></Button>)}</GdsStack>
      <GdsStack onSubmit={save} component="form" gap="md" padding="md">
        <SectionTitle order={3}>Alapadatok</SectionTitle><SimpleGrid spacing="md" cols={{
          base: 1,
          md: 2
        }}>
          <TextInput value={draft.id || ''} disabled={mode === 'edit'} onChange={e => setField('id', e.target.value)} label={<>Termék ID</>} /><TextInput value={draft.slug || ''} onChange={e => setField('slug', e.target.value)} label={<>Olvasható URL slug</>} /><TextInput value={draft.sku || ''} onChange={e => setField('sku', e.target.value)} label={<>SKU</>} /><TextInput value={draft.barcode || ''} onChange={e => setField('barcode', e.target.value)} label={<>Vonalkód / EAN</>} />
          <TextInput value={draft.name || ''} onChange={e => setField('name', e.target.value)} label={<>Név</>} /><TextInput value={draft.subtitle || ''} onChange={e => setField('subtitle', e.target.value)} label={<>Alcím</>} />
          <Select value={draft.category || 'braai'} onChange={e => setField('category', e ?? "")} label={<>Kategória</>} data={categoryOptions.map(v => ({
            value: String(v),
            label: String(v)
          }))} /><TextInput value={draft.categoryName || ''} onChange={e => setField('categoryName', e.target.value)} label={<>Kategória neve</>} /><TextInput value={draft.badge || ''} onChange={e => setField('badge', e.target.value)} label={<>Badge</>} /><TextInput value={draft.tone || ''} onChange={e => setField('tone', e.target.value)} label={<>Színtéma</>} />
          <TextInput type="number" value={draft.price ?? ''} onChange={e => setField('price', e.target.value)} label={<>Ár</>} /><TextInput type="number" value={draft.vatRate ?? 27} onChange={e => setField('vatRate', e.target.value)} label={<>ÁFA %</>} /><TextInput value={draft.currency || 'HUF'} onChange={e => setField('currency', e.target.value)} label={<>Pénznem</>} /><TextInput value={draft.brand || ''} onChange={e => setField('brand', e.target.value)} label={<>Márka</>} /><TextInput value={draft.originCountry || ''} onChange={e => setField('originCountry', e.target.value)} label={<>Származási ország</>} />
        </SimpleGrid>
        <SectionTitle order={3}>Képek</SectionTitle><SimpleGrid spacing="md" cols={{
          base: 1,
          md: 2
        }}><TextInput value={draft.image || ''} onChange={e => setField('image', e.target.value)} label={<>Kártyakép</>} /><TextInput value={draft.heroImage || ''} onChange={e => setField('heroImage', e.target.value)} label={<>Hero kép</>} /><TextInput value={draft.editorialImage || ''} onChange={e => setField('editorialImage', e.target.value)} label={<>Editorial kép</>} /><TextInput value={draft.editorialCaption || ''} onChange={e => setField('editorialCaption', e.target.value)} label={<>Editorial képaláírás</>} /></SimpleGrid>
        <SectionTitle order={3}>Storefront és termékoldal tartalom</SectionTitle><SimpleGrid spacing="md" cols={{
          base: 1,
          md: 2
        }}>
          <Textarea value={draft.story || ''} onChange={e => setField('story', e.target.value)} label={<>Rövid leírás / összefoglaló</>} /><Textarea value={draft.whatItIs || ''} onChange={e => setField('whatItIs', e.target.value)} label={<>Mi ez?</>} /><Textarea value={draft.background || ''} onChange={e => setField('background', e.target.value)} label={<>Dél-afrikai háttér</>} /><Textarea value={draft.flavour || ''} onChange={e => setField('flavour', e.target.value)} label={<>Ízprofil</>} /><Textarea value={draft.audience || ''} onChange={e => setField('audience', e.target.value)} label={<>Kinek ajánljuk?</>} /><Textarea value={draft.packaging || ''} onChange={e => setField('packaging', e.target.value)} label={<>Csomagolás</>} /><Textarea value={draft.info || ''} onChange={e => setField('info', e.target.value)} label={<>Kiegészítő termékinformáció</>} />
          <Textarea value={draft.ingredients || ''} onChange={e => setField('ingredients', e.target.value)} label={<>Összetevők</>} /><Textarea value={draft.allergens || ''} onChange={e => setField('allergens', e.target.value)} label={<>Allergének</>} /><Textarea value={draft.storage || ''} onChange={e => setField('storage', e.target.value)} label={<>Tárolás</>} /><Textarea value={draft.nutrition || ''} onChange={e => setField('nutrition', e.target.value)} label={<>Tápérték</>} /><Textarea value={(draft.pairings || []).join('\n')} onChange={e => setField('pairings', e.target.value.split('\n'))} label={<>Párosítások – soronként</>} /><Textarea value={(draft.servingIdeas || []).join('\n')} onChange={e => setField('servingIdeas', e.target.value.split('\n'))} label={<>Tálalási ötletek – soronként</>} /><Textarea value={faqText()} onChange={e => setFaq(e.target.value)} label={<>FAQ – soronként: kérdés[TAB]válasz</>} />
        </SimpleGrid>
        <SectionTitle order={3}>SEO és AI-search</SectionTitle><SimpleGrid spacing="md" cols={{
          base: 1,
          md: 2
        }}><TextInput value={draft.seo?.title || ''} onChange={e => setField('seo.title', e.target.value)} label={<>SEO cím</>} /><Textarea value={draft.seo?.description || ''} onChange={e => setField('seo.description', e.target.value)} label={<>Meta leírás</>} /><Textarea value={draft.seo?.aiSummary || ''} onChange={e => setField('seo.aiSummary', e.target.value)} label={<>AI/GPT összefoglaló</>} /><TextInput value={draft.seo?.ogTitle || ''} onChange={e => setField('seo.ogTitle', e.target.value)} label={<>Open Graph cím</>} /><Textarea value={draft.seo?.ogDescription || ''} onChange={e => setField('seo.ogDescription', e.target.value)} label={<>Open Graph leírás</>} /></SimpleGrid>
        <SectionTitle order={3}>Termék fizikai adatai</SectionTitle><SimpleGrid spacing="md" cols={{
          base: 1,
          md: 2
        }}><TextInput type="number" value={draft.dimensions?.widthMm ?? 0} onChange={e => setField('dimensions.widthMm', e.target.value)} label={<>Szélesség mm</>} /><TextInput type="number" value={draft.dimensions?.heightMm ?? 0} onChange={e => setField('dimensions.heightMm', e.target.value)} label={<>Magasság mm</>} /><TextInput type="number" value={draft.dimensions?.depthMm ?? 0} onChange={e => setField('dimensions.depthMm', e.target.value)} label={<>Mélység mm</>} /><TextInput type="number" value={draft.dimensions?.weightG ?? 0} onChange={e => setField('dimensions.weightG', e.target.value)} label={<>Tömeg g</>} /></SimpleGrid>
        <SectionTitle order={3}>Parcel / szállítási csomag</SectionTitle><SimpleGrid spacing="md" cols={{
          base: 1,
          md: 2
        }}><TextInput type="number" value={draft.parcel?.widthMm ?? 0} onChange={e => setField('parcel.widthMm', e.target.value)} label={<>Parcel szélesség mm</>} /><TextInput type="number" value={draft.parcel?.heightMm ?? 0} onChange={e => setField('parcel.heightMm', e.target.value)} label={<>Parcel magasság mm</>} /><TextInput type="number" value={draft.parcel?.depthMm ?? 0} onChange={e => setField('parcel.depthMm', e.target.value)} label={<>Parcel mélység mm</>} /><TextInput type="number" value={draft.parcel?.weightG ?? 0} onChange={e => setField('parcel.weightG', e.target.value)} label={<>Parcel tömeg g</>} /><TextInput type="number" value={draft.parcel?.unitsPerParcel ?? 1} onChange={e => setField('parcel.unitsPerParcel', e.target.value)} label={<>Termék / parcel</>} /></SimpleGrid>
        <SectionTitle order={3}>Készlet</SectionTitle><SimpleGrid spacing="md" cols={{
          base: 1,
          md: 2
        }}><TextInput type="number" value={draft.inventory?.stockQty ?? 0} onChange={e => setField('inventory.stockQty', e.target.value)} label={<>Készlet darab</>} /><TextInput type="number" value={draft.inventory?.reservedQty ?? 0} onChange={e => setField('inventory.reservedQty', e.target.value)} label={<>Foglalt darab</>} /><TextInput type="number" value={draft.inventory?.lowStockThreshold ?? 3} onChange={e => setField('inventory.lowStockThreshold', e.target.value)} label={<>Alacsony készlet limit</>} /><Checkbox checked={draft.inventory?.trackInventory !== false} onChange={e => setField('inventory.trackInventory', e.target.checked)} label={<> Készletkövetés</>} /><Checkbox checked={draft.active !== false} onChange={e => setField('active', e.target.checked)} label={<> Aktív</>} /><Checkbox checked={draft.purchasable !== false} onChange={e => setField('purchasable', e.target.checked)} label={<> Rendelhető</>} /></SimpleGrid>
        <GdsInline gap="md"><Button type="submit">Mentés</Button>{mode === 'edit' && <Button type="button" onClick={() => setDeleteOpen(true)} variant="default">Törlés</Button>}</GdsInline>
      </GdsStack></SimpleGrid>
  </>;
}
