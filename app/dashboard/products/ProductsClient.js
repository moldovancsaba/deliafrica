'use client';

import { useEffect, useMemo, useState } from 'react';

const emptyProduct = {
  id: '', slug: '', sku: '', barcode: '', name: '', subtitle: '', category: 'braai', categoryName: '', badge: '', tone: 'red', visual: '', image: '', editorialImage: '', price: '', currency: 'HUF', vatRate: 27, active: true, purchasable: true,
  story: '', whatItIs: '', flavour: '', audience: '', packaging: '', originCountry: 'South Africa', brand: '', ingredients: '', allergens: '', storage: '', nutrition: '', pairings: [], servingIdeas: [],
  dimensions: { widthMm: 0, heightMm: 0, depthMm: 0, weightG: 0 },
  parcel: { widthMm: 0, heightMm: 0, depthMm: 0, weightG: 0, unitsPerParcel: 1 },
  inventory: { stockQty: 0, reservedQty: 0, lowStockThreshold: 3, trackInventory: true }
};

const categoryOptions = ['braai','spices','pate','tea','snacks','pantry'];
const n = (value) => Number.isFinite(Number(value)) ? Number(value) : 0;

export default function ProductsClient() {
  const [products, setProducts] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [draft, setDraft] = useState(emptyProduct);
  const [mode, setMode] = useState('edit');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const selected = useMemo(() => products.find(p => p.id === selectedId), [products, selectedId]);

  async function load() {
    setError('');
    const res = await fetch('/api/admin/products', { cache: 'no-store' });
    const data = await res.json();
    if (!res.ok) { setError(data.error || 'Nem sikerült betölteni a termékeket.'); return; }
    setProducts(data.products || []);
    if (!selectedId && data.products?.length) setSelectedId(data.products[0].id);
  }

  useEffect(() => { load(); }, []);
  useEffect(() => { if (selected) { setDraft(JSON.parse(JSON.stringify(selected))); setMode('edit'); } }, [selected]);

  function setField(path, value) {
    setDraft(current => {
      const next = JSON.parse(JSON.stringify(current));
      const parts = path.split('.');
      let ref = next;
      for (let i = 0; i < parts.length - 1; i++) ref = ref[parts[i]];
      ref[parts.at(-1)] = value;
      return next;
    });
  }

  function newProduct() {
    setMode('new'); setSelectedId(''); setDraft(JSON.parse(JSON.stringify(emptyProduct))); setMessage(''); setError('');
  }

  async function save(event) {
    event.preventDefault(); setMessage(''); setError('');
    const payload = {
      ...draft,
      price: draft.price === '' ? null : n(draft.price),
      vatRate: n(draft.vatRate),
      dimensions: Object.fromEntries(Object.entries(draft.dimensions || {}).map(([k,v]) => [k,n(v)])),
      parcel: Object.fromEntries(Object.entries(draft.parcel || {}).map(([k,v]) => [k,n(v)])),
      inventory: { ...draft.inventory, stockQty:n(draft.inventory?.stockQty), reservedQty:n(draft.inventory?.reservedQty), lowStockThreshold:n(draft.inventory?.lowStockThreshold) },
      pairings: Array.isArray(draft.pairings) ? draft.pairings : String(draft.pairings || '').split('\n').map(v=>v.trim()).filter(Boolean),
      servingIdeas: Array.isArray(draft.servingIdeas) ? draft.servingIdeas : String(draft.servingIdeas || '').split('\n').map(v=>v.trim()).filter(Boolean)
    };
    const res = await fetch('/api/admin/products', { method: mode === 'new' ? 'POST' : 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
    const data = await res.json();
    if (!res.ok) { setError(data.error || 'Mentési hiba.'); return; }
    setMessage('Termék mentve.');
    await load();
    setSelectedId(data.product.id);
  }

  async function remove() {
    if (!draft.id || !confirm(`Törlöd ezt a terméket: ${draft.name}?`)) return;
    const res = await fetch('/api/admin/products', { method:'DELETE', headers:{'content-type':'application/json'}, body:JSON.stringify({ id:draft.id }) });
    const data = await res.json();
    if (!res.ok) { setError(data.error || 'Törlési hiba.'); return; }
    setMessage('Termék törölve.'); setSelectedId(''); setDraft(emptyProduct); await load();
  }

  return <>
    <div className="admin-page-head"><div><span className="admin-kicker">PRODUCT CATALOGUE</span><h1>Termékek</h1><p>Teljes CRUD, készlet, fizikai méretek, parcel adatok, ár és tartalom.</p></div><button className="admin-button red" onClick={newProduct}>+ Új termék</button></div>
    {message && <div className="admin-message">{message}</div>}{error && <div className="admin-error">{error}</div>}
    <div className="product-editor">
      <aside className="product-list">{products.map(product => <button key={product.id} className={selectedId===product.id?'active':''} onClick={() => setSelectedId(product.id)}><b>{product.name}</b><br/><small>{product.sku || product.id} · készlet: {product.inventory?.stockQty ?? 0}</small></button>)}</aside>
      <form className="admin-panel" style={{marginTop:0}} onSubmit={save}>
        <div className="admin-form-grid">
          <label>Termék ID<input value={draft.id || ''} disabled={mode==='edit'} onChange={e=>setField('id',e.target.value)} /></label>
          <label>Olvasható URL slug<input value={draft.slug || ''} onChange={e=>setField('slug',e.target.value)} /></label>
          <label>SKU<input value={draft.sku || ''} onChange={e=>setField('sku',e.target.value)} /></label>
          <label>Vonalkód / EAN<input value={draft.barcode || ''} onChange={e=>setField('barcode',e.target.value)} /></label>
          <label className="wide">Név<input value={draft.name || ''} onChange={e=>setField('name',e.target.value)} /></label>
          <label className="wide">Alcím<input value={draft.subtitle || ''} onChange={e=>setField('subtitle',e.target.value)} /></label>
          <label>Kategória<select value={draft.category || 'braai'} onChange={e=>setField('category',e.target.value)}>{categoryOptions.map(v=><option key={v}>{v}</option>)}</select></label>
          <label>Kategória neve<input value={draft.categoryName || ''} onChange={e=>setField('categoryName',e.target.value)} /></label>
          <label>Badge<input value={draft.badge || ''} onChange={e=>setField('badge',e.target.value)} /></label>
          <label>Színtéma<input value={draft.tone || ''} onChange={e=>setField('tone',e.target.value)} /></label>
          <label>Ár<input type="number" value={draft.price ?? ''} onChange={e=>setField('price',e.target.value)} /></label>
          <label>ÁFA %<input type="number" value={draft.vatRate ?? 27} onChange={e=>setField('vatRate',e.target.value)} /></label>
          <label>Pénznem<input value={draft.currency || 'HUF'} onChange={e=>setField('currency',e.target.value)} /></label>
          <label>Márka<input value={draft.brand || ''} onChange={e=>setField('brand',e.target.value)} /></label>
          <label>Származási ország<input value={draft.originCountry || ''} onChange={e=>setField('originCountry',e.target.value)} /></label>
          <label>Kép fájl<input value={draft.image || ''} onChange={e=>setField('image',e.target.value)} /></label>
          <label>Editorial kép<input value={draft.editorialImage || ''} onChange={e=>setField('editorialImage',e.target.value)} /></label>
          <label className="wide">Rövid leírás<textarea value={draft.story || ''} onChange={e=>setField('story',e.target.value)} /></label>
          <label className="wide">Mi ez?<textarea value={draft.whatItIs || ''} onChange={e=>setField('whatItIs',e.target.value)} /></label>
          <label className="wide">Ízprofil<textarea value={draft.flavour || ''} onChange={e=>setField('flavour',e.target.value)} /></label>
          <label className="wide">Kinek ajánljuk?<textarea value={draft.audience || ''} onChange={e=>setField('audience',e.target.value)} /></label>
          <label className="wide">Csomagolás<textarea value={draft.packaging || ''} onChange={e=>setField('packaging',e.target.value)} /></label>
          <label className="wide">Összetevők<textarea value={draft.ingredients || ''} onChange={e=>setField('ingredients',e.target.value)} /></label>
          <label className="wide">Allergének<textarea value={draft.allergens || ''} onChange={e=>setField('allergens',e.target.value)} /></label>
          <label className="wide">Tárolás<textarea value={draft.storage || ''} onChange={e=>setField('storage',e.target.value)} /></label>
          <label className="wide">Tápérték<textarea value={draft.nutrition || ''} onChange={e=>setField('nutrition',e.target.value)} /></label>
          <label className="wide">Párosítások – soronként<textarea value={(draft.pairings || []).join('\n')} onChange={e=>setField('pairings',e.target.value.split('\n'))} /></label>
          <label className="wide">Tálalási ötletek – soronként<textarea value={(draft.servingIdeas || []).join('\n')} onChange={e=>setField('servingIdeas',e.target.value.split('\n'))} /></label>
        </div>
        <h3>Termék fizikai adatai</h3><div className="admin-form-grid">
          <label>Szélesség mm<input type="number" value={draft.dimensions?.widthMm ?? 0} onChange={e=>setField('dimensions.widthMm',e.target.value)} /></label>
          <label>Magasság mm<input type="number" value={draft.dimensions?.heightMm ?? 0} onChange={e=>setField('dimensions.heightMm',e.target.value)} /></label>
          <label>Mélység mm<input type="number" value={draft.dimensions?.depthMm ?? 0} onChange={e=>setField('dimensions.depthMm',e.target.value)} /></label>
          <label>Tömeg g<input type="number" value={draft.dimensions?.weightG ?? 0} onChange={e=>setField('dimensions.weightG',e.target.value)} /></label>
        </div>
        <h3>Parcel / szállítási csomag</h3><div className="admin-form-grid">
          <label>Parcel szélesség mm<input type="number" value={draft.parcel?.widthMm ?? 0} onChange={e=>setField('parcel.widthMm',e.target.value)} /></label>
          <label>Parcel magasság mm<input type="number" value={draft.parcel?.heightMm ?? 0} onChange={e=>setField('parcel.heightMm',e.target.value)} /></label>
          <label>Parcel mélység mm<input type="number" value={draft.parcel?.depthMm ?? 0} onChange={e=>setField('parcel.depthMm',e.target.value)} /></label>
          <label>Parcel tömeg g<input type="number" value={draft.parcel?.weightG ?? 0} onChange={e=>setField('parcel.weightG',e.target.value)} /></label>
          <label>Termék / parcel<input type="number" value={draft.parcel?.unitsPerParcel ?? 1} onChange={e=>setField('parcel.unitsPerParcel',e.target.value)} /></label>
        </div>
        <h3>Készlet</h3><div className="admin-form-grid">
          <label>Készlet darab<input type="number" value={draft.inventory?.stockQty ?? 0} onChange={e=>setField('inventory.stockQty',e.target.value)} /></label>
          <label>Foglalt darab<input type="number" value={draft.inventory?.reservedQty ?? 0} onChange={e=>setField('inventory.reservedQty',e.target.value)} /></label>
          <label>Alacsony készlet limit<input type="number" value={draft.inventory?.lowStockThreshold ?? 3} onChange={e=>setField('inventory.lowStockThreshold',e.target.value)} /></label>
          <label><input type="checkbox" checked={draft.inventory?.trackInventory !== false} onChange={e=>setField('inventory.trackInventory',e.target.checked)} /> Készletkövetés</label>
          <label><input type="checkbox" checked={draft.active !== false} onChange={e=>setField('active',e.target.checked)} /> Aktív</label>
          <label><input type="checkbox" checked={draft.purchasable !== false} onChange={e=>setField('purchasable',e.target.checked)} /> Rendelhető</label>
        </div>
        <div className="admin-toolbar"><button className="admin-button red">Mentés</button>{mode==='edit' && <button type="button" className="admin-button light" onClick={remove}>Törlés</button>}</div>
      </form>
    </div>
  </>;
}
