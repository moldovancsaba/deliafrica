'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { categories, products, formatPrice } from '@/lib/products';
import ProductVisual from '@/app/components/ProductVisual';
import BrandLogo from '@/app/components/BrandLogo';

export default function Home() {
  const [category, setCategory] = useState('all');
  const [cart, setCart] = useState({});
  const [cartOpen, setCartOpen] = useState(false);
  const [detail, setDetail] = useState(null);
  const [checkout, setCheckout] = useState(false);
  const [orderState, setOrderState] = useState(null);
  const [form, setForm] = useState({ customerName: '', email: '', phone: '', address: '' });

  const shown = useMemo(() => category === 'all' ? products : products.filter(p => p.category === category), [category]);
  const cartRows = Object.entries(cart).map(([id, quantity]) => ({ product: products.find(p => p.id === id), quantity })).filter(r => r.product);
  const cartCount = cartRows.reduce((s, r) => s + r.quantity, 0);
  const total = cartRows.reduce((s, r) => s + r.product.price * r.quantity, 0);

  function add(id) {
    setCart(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
    setCartOpen(true);
  }

  function setQty(id, qty) {
    setCart(prev => {
      const next = { ...prev };
      if (qty <= 0) delete next[id]; else next[id] = qty;
      return next;
    });
  }

  async function placeOrder(e) {
    e.preventDefault();
    setOrderState({ loading: true });
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ...form, items: cartRows.map(r => ({ productId: r.product.id, quantity: r.quantity })) })
    });
    const data = await res.json();
    setOrderState(data);
    if (data.ok) {
      setCart({});
      setCheckout(false);
    }
  }

  return <main>
    <header className="site-header">
      <a href="#top" className="brand-link" aria-label="deli.africa kezdőlap"><BrandLogo /></a>
      <nav><a href="#shop">Shop</a><a href="#story">Történet</a><a href="#why">Miért mi?</a><Link href="/dashboard">Dashboard</Link></nav>
      <button className="cart-button" onClick={() => setCartOpen(true)}>Kosár <span>{cartCount}</span></button>
    </header>

    <section className="hero" id="top">
      <div className="hero-copy">
        <div className="eyebrow">CURATED DELIGHTS. REAL STORIES.</div>
        <h1>TASTE<br/>SOUTH<br/>AFRICA.</h1>
        <p>Dél-Afrika karakteres ízei hozzád közelebb. Válogatott braai szószok, chutney-k, rooibos teák, fűszerek és kultikus snackek.</p>
        <a className="button button-red" href="#shop">Fedezd fel</a>
      </div>
      <div className="hero-stage">
        <div className="sun-disc">FROM<br/>CAPE<br/>TO<br/>YOU</div>
        <ProductVisual product={products[0]} large/>
        <ProductVisual product={products[1]} large/>
        <ProductVisual product={products[2]} large/>
        <div className="spice-sweep">peri · coriander · rooibos · smoke</div>
      </div>
    </section>

    <section className="trust-strip" id="why">
      <div><b>Authentic origins.</b><span>Megbízható eredet, ellenőrizhető háttér.</span></div>
      <div><b>Curated with care.</b><span>Nem minden kerül be — csak amit jó szívvel ajánlunk.</span></div>
      <div><b>Made to be enjoyed.</b><span>Ízekhez, párosításhoz és alkalmakhoz.</span></div>
      <div><b>Perfect for gifting.</b><span>Ajándéknak is karakteres választás.</span></div>
    </section>

    <section className="story-block" id="story">
      <div><span className="eyebrow dark">DÉL-AFRIKA, VÁLOGATVA.</span><h2>Nem csak termékeket hozunk. Kontextust is.</h2></div>
      <p>A deli.africa egy kurált webshop-koncepció: erős vizuális identitással, egyszerű vásárlási folyamattal és olyan termékoldalakkal, amelyek megmutatják, miért különleges egy adott íz. A cél: könnyen felfedezhető, bizalomépítő és ajándékozható dél-afrikai kínálat.</p>
    </section>

    <section className="shop" id="shop">
      <div className="section-head">
        <div><span className="eyebrow dark">SHOP THE COLLECTION</span><h2>Mit kóstolnál meg?</h2></div>
        <div className="category-tabs">{categories.map(c => <button className={category === c.id ? 'active' : ''} key={c.id} onClick={() => setCategory(c.id)}>{c.label}</button>)}</div>
      </div>
      <div className="product-grid">{shown.map(product => <article className="product-card" key={product.id}>
        <button className="visual-button" onClick={() => setDetail(product)}><ProductVisual product={product}/><span className="badge">{product.badge}</span></button>
        <div className="product-info"><small>{product.subtitle}</small><h3>{product.name}</h3><p>{product.story}</p><div className="product-bottom"><strong>{formatPrice(product.price)}</strong><button onClick={() => add(product.id)} aria-label={`${product.name} kosárba`}>+</button></div></div>
      </article>)}</div>
    </section>

    <section className="editorial">
      <div className="editorial-card red"><span>BRAAI NIGHT?</span><b>Fire up the flavour.</b></div>
      <div className="editorial-card olive"><span>PERI-PERI</span><b>Makes it better.</b></div>
      <div className="editorial-card fig"><span>SWEET + SPICY</span><b>Perfect contrast.</b></div>
      <div className="editorial-card mango"><span>ROOIBOS</span><b>Tea. Slow down.</b></div>
    </section>

    <footer>
      <BrandLogo inverse />
      <p>Budapest · Hungary<br/>Demo webshop MVP</p>
      <div><a href="#shop">Shop</a><Link href="/dashboard">System dashboard</Link></div>
    </footer>

    {detail && <div className="modal-backdrop" onClick={() => setDetail(null)}><div className="detail-modal" onClick={e => e.stopPropagation()}>
      <button className="close" onClick={() => setDetail(null)}>×</button>
      <ProductVisual product={detail} large/>
      <div><span className="badge inline">{detail.badge}</span><h2>{detail.name}</h2><p>{detail.story}</p><strong>{formatPrice(detail.price)}</strong><div className="modal-actions"><button className="button button-red" onClick={() => { add(detail.id); setDetail(null); }}>Kosárba</button><Link className="button button-outline" href={`/products/${detail.slug}`}>Többet akarok tudni</Link></div></div>
    </div></div>}

    <aside className={`cart-drawer ${cartOpen ? 'open' : ''}`}>
      <div className="drawer-head"><h2>Kosár</h2><button onClick={() => setCartOpen(false)}>×</button></div>
      {cartRows.length === 0 ? <div className="empty-cart">A kosarad még üres.<button className="button button-dark" onClick={() => setCartOpen(false)}>Válogatok tovább</button></div> : <>
        <div className="cart-lines">{cartRows.map(({ product, quantity }) => <div className="cart-line" key={product.id}><ProductVisual product={product}/><div><b>{product.name}</b><span>{formatPrice(product.price)}</span><div className="qty"><button onClick={() => setQty(product.id, quantity - 1)}>−</button><span>{quantity}</span><button onClick={() => setQty(product.id, quantity + 1)}>+</button></div></div></div>)}</div>
        <div className="cart-total"><span>Összesen</span><strong>{formatPrice(total)}</strong></div>
        <button className="button button-red full" onClick={() => setCheckout(true)}>Tovább a rendeléshez</button>
      </>}
    </aside>
    {cartOpen && <button className="drawer-overlay" aria-label="Kosár bezárása" onClick={() => setCartOpen(false)}/>}

    {checkout && <div className="modal-backdrop"><form className="checkout-modal" onSubmit={placeOrder}>
      <button type="button" className="close" onClick={() => setCheckout(false)}>×</button>
      <span className="eyebrow dark">CHECKOUT</span><h2>Rendelési adatok</h2>
      <div className="form-grid">
        <label>Név<input required value={form.customerName} onChange={e => setForm({ ...form, customerName: e.target.value })}/></label>
        <label>E-mail<input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}/></label>
        <label>Telefon<input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}/></label>
        <label className="wide">Szállítási cím<textarea required value={form.address} onChange={e => setForm({ ...form, address: e.target.value })}/></label>
      </div>
      <div className="cart-total"><span>Fizetendő</span><strong>{formatPrice(total)}</strong></div>
      <button className="button button-red full" disabled={orderState?.loading}>{orderState?.loading ? 'Küldés…' : 'Rendelés leadása'}</button>
      {orderState && !orderState.loading && !orderState.ok && <p className="form-error">{orderState.error}</p>}
    </form></div>}

    {orderState?.ok && <div className="order-toast"><b>Köszönjük!</b><span>Rendelés: {orderState.reference}</span><small>{orderState.message}</small><button onClick={() => setOrderState(null)}>×</button></div>}
  </main>;
}
