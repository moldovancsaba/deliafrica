'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { categories, products, formatPrice } from '@/lib/products';
import ProductVisual from '@/app/components/ProductVisual';
import BrandLogo from '@/app/components/BrandLogo';
import { APP_VERSION } from '@/lib/version';

const heroScenes = [
  { category: 'braai', image: '/hero-scenes/braai.webp' },
  { category: 'spices', image: '/hero-scenes/spices.webp' },
  { category: 'pate', image: '/hero-scenes/pate.webp' },
  { category: 'tea', image: '/hero-scenes/tea.webp' },
  { category: 'snacks', image: '/hero-scenes/snacks.webp' }
];

export default function Home() {
  const [category, setCategory] = useState('all');
  const [cart, setCart] = useState({});
  const [cartOpen, setCartOpen] = useState(false);
  const [detail, setDetail] = useState(null);
  const [checkout, setCheckout] = useState(false);
  const [orderState, setOrderState] = useState(null);
  const [form, setForm] = useState({ customerName: '', email: '', phone: '', address: '' });
  const [session, setSession] = useState(null);
  const [heroScene, setHeroScene] = useState(heroScenes[0]);
  const [heroProducts, setHeroProducts] = useState(() => products.filter(product => product.category === heroScenes[0].category).slice(0, 1));
  const cartReady = useRef(false);

  useEffect(() => {
    const saved = window.localStorage.getItem('deli-cart');
    if (saved) { try { setCart(JSON.parse(saved)); } catch { window.localStorage.removeItem('deli-cart'); } }
    cartReady.current = true;
    fetch('/api/auth/session', { cache: 'no-store' }).then((res) => res.json()).then((data) => {
      setSession(data);
      if (data.authenticated) setForm((current) => ({ ...current, customerName: data.user.name || current.customerName, email: data.user.email || current.email }));
    }).catch(() => setSession({ authenticated: false }));
  }, []);

  useEffect(() => { if (cartReady.current) window.localStorage.setItem('deli-cart', JSON.stringify(cart)); }, [cart]);

  useEffect(() => {
    const chooseScene = () => {
      const scene = heroScenes[Math.floor(Math.random() * heroScenes.length)];
      const shuffled = products.filter(product => product.category === scene.category);
      for (let index = shuffled.length - 1; index > 0; index--) {
        const swapWith = Math.floor(Math.random() * (index + 1));
        [shuffled[index], shuffled[swapWith]] = [shuffled[swapWith], shuffled[index]];
      }
      setHeroScene(scene);
      setHeroProducts(shuffled.slice(0, 1));
    };
    chooseScene();
  }, []);

  const shown = useMemo(() => category === 'all' ? products : products.filter(p => p.category === category), [category]);
  const cartRows = Object.entries(cart).map(([id, quantity]) => ({ product: products.find(p => p.id === id), quantity })).filter(r => r.product);
  const cartCount = cartRows.reduce((s, r) => s + r.quantity, 0);
  const total = cartRows.reduce((s, r) => s + (r.product.price || 0) * r.quantity, 0);

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

  function beginCheckout() {
    if (session?.configured === false) {
      setCheckout(true);
      return;
    }
    if (!session?.authenticated) {
      window.localStorage.setItem('deli-cart', JSON.stringify(cart));
      window.location.assign('/api/auth/login?returnTo=%2F%23shop');
      return;
    }
    setCheckout(true);
  }

  return <main>
    <header className="site-header">
      <a href="#top" className="brand-link" aria-label="deli.africa kezdőlap"><BrandLogo /></a>
      <nav><a href="#shop">Shop</a><a href="#story">Történet</a><a href="#why">Miért mi?</a>{session?.permission?.status === 'approved' && session?.permission?.role === 'admin' && <Link href="/dashboard">Dashboard</Link>}</nav>
      <div className="header-actions">{session?.authenticated ? <a className="account-link" href="/api/auth/logout" title="Kijelentkezés">{session.user.name}</a> : <a className="account-link" href="/api/auth/login?returnTo=%2F%23shop">Belépés</a>}<button className="cart-button" onClick={() => setCartOpen(true)}>Kosár <span>{cartCount}</span></button></div>
    </header>

    <section className="hero" id="top">
      <div className="hero-copy">
        <div className="eyebrow">DÉL-AFRIKAI KEDVENCEK. NEKED VÁLOGATVA.</div>
        <h1>TASTE<br/>SOUTH<br/>AFRICA.</h1>
        <p>Dél-Afrika karakteres ízei hozzád közelebb. Válogatott braai szószok, chutney-k, rooibos teák, fűszerek és kultikus snackek.</p>
        <a className="button button-red" href="#shop">Fedezd fel</a>
      </div>
      <div className={`hero-stage hero-category-${heroScene.category}`} style={{ backgroundImage: `url(${heroScene.image})` }}>
        <div className="sun-disc">FROM<br/>CAPE<br/>TO<br/>YOU</div>
        <div className={`hero-products hero-products-${heroProducts.length}`}>{heroProducts.map((product, index) => <ProductVisual product={product} large className={`hero-product hero-count-${heroProducts.length} hero-product-${index + 1}`} key={product.id}/>)}</div>
        <div className="spice-sweep">peri · coriander · rooibos · smoke</div>
      </div>
    </section>

    <section className="story-block" id="story">
      <div><span className="eyebrow dark">A DELI.AFRICA TÖRTÉNETE</span><h2>Dél-afrikai ízek, érthetően és könnyen kipróbálhatóan.</h2></div>
      <div className="story-copy"><p>A deli.africa azért született, hogy a dél-afrikai kamra karakteres kedvencei ne csak különlegességek legyenek, hanem a hétköznapi étkezések részei is. A válogatásban a füstös braai, a citrusos peri-peri, a rooibos és az otthonos snackek világa találkozik.</p><p>Nem feltételezzük, hogy már ismered őket: minden terméknél megmutatjuk az ízprofilt, a legjobb párosításokat és egy egyszerű első kóstolási ötletet. Így magabiztosan választhatsz magadnak vagy ajándékba.</p><a className="story-link" href="#shop">Megnézem a válogatást →</a></div>
    </section>

    <section className="why-block" id="why">
      <div className="why-heading"><span className="eyebrow">MIÉRT DELI.AFRICA?</span><h2>Kevesebb találgatás.<br/>Több jó falat.</h2><p>Olyan válogatást építünk, amelyben gyorsan megtalálod az alkalomhoz és az ízlésedhez illő terméket.</p></div>
      <div className="why-grid">
        <article><b>01</b><h3>13 átlátható választás</h3><p>Szűk, gondosan bemutatott kínálat: nem kell több száz hasonló terméket végignézned.</p></article>
        <article><b>02</b><h3>Íz alapján dönthetsz</h3><p>Minden oldalon konkrét ízjegyeket, felhasználási módokat és párosításokat találsz.</p></article>
        <article><b>03</b><h3>Konyhakész ötletek</h3><p>Megmutatjuk, mit tegyél a grillre, a reggeli mellé, a teáscsészébe vagy az ajándékcsomagba.</p></article>
        <article><b>04</b><h3>Őszinte termékinformáció</h3><p>Ahol egy adat vagy ár még nem végleges, azt egyértelműen jelezzük; a csomagolás marad az irányadó.</p></article>
      </div>
    </section>

    <section className="shop" id="shop">
      <div className="section-head"><div><span className="eyebrow dark">SHOP THE COLLECTION</span><h2>Mit kóstolnál meg?</h2></div><button className={`category-reset ${category === 'all' ? 'active' : ''}`} onClick={() => setCategory('all')}>Minden termék</button></div>
      <div className="category-selector" aria-label="Termékkategóriák">{categories.filter(c => c.id !== 'all').map(c => <div className={`category-tile ${c.tone} ${category === c.id ? 'active' : ''}`} key={c.id}><button onClick={() => setCategory(c.id)} aria-pressed={category === c.id}><span>{c.visualLabel.map(line => <b key={line}>{line}</b>)}</span><Image src={c.image} alt="" fill sizes="(max-width: 650px) 62vw, 17vw" /></button><Link href={`/categories/${c.id}`}>Kategória bemutatása →</Link></div>)}</div>
      <div className="product-grid">{shown.map(product => <article className="product-card" key={product.id}>
        <button className={`visual-button tone-${product.tone}`} onClick={() => setDetail(product)}><ProductVisual product={product}/><span className="badge">{product.badge}</span></button>
        <div className="product-info"><small>{product.subtitle}</small><h3>{product.name}</h3><p>{product.story}</p><div className="product-bottom"><strong>{formatPrice(product.price)}</strong><button disabled={product.price == null} onClick={() => add(product.id)} aria-label={`${product.name} kosárba`}>{product.price == null ? '–' : '+'}</button></div></div>
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
      <p>Budapest · Hungary<br/>deli.africa v{APP_VERSION}</p>
      <div><a href="#shop">Shop</a></div>
    </footer>

    {detail && <div className="modal-backdrop" onClick={() => setDetail(null)}><div className={`detail-modal category-${detail.category}`} onClick={e => e.stopPropagation()}>
      <button className="close" onClick={() => setDetail(null)}>×</button>
      <ProductVisual product={detail} large/>
      <div><span className="badge inline">{detail.badge}</span><h2>{detail.name}</h2><p>{detail.story}</p><strong>{formatPrice(detail.price)}</strong><div className="modal-actions">{detail.price != null && <button className="button button-red" onClick={() => { add(detail.id); setDetail(null); }}>Kosárba</button>}<Link className="button button-outline" href={`/products/${detail.slug}`}>Többet akarok tudni</Link></div></div>
    </div></div>}

    <aside className={`cart-drawer ${cartOpen ? 'open' : ''}`}>
      <div className="drawer-head"><h2>Kosár</h2><button onClick={() => setCartOpen(false)}>×</button></div>
      {cartRows.length === 0 ? <div className="empty-cart">A kosarad még üres.<button className="button button-dark" onClick={() => setCartOpen(false)}>Válogatok tovább</button></div> : <>
        <div className="cart-lines">{cartRows.map(({ product, quantity }) => <div className="cart-line" key={product.id}><ProductVisual product={product}/><div><b>{product.name}</b><span>{formatPrice(product.price)}</span><div className="qty"><button onClick={() => setQty(product.id, quantity - 1)}>−</button><span>{quantity}</span><button onClick={() => setQty(product.id, quantity + 1)}>+</button></div></div></div>)}</div>
        <div className="cart-total"><span>Összesen</span><strong>{formatPrice(total)}</strong></div>
        <button className="button button-red full" onClick={beginCheckout}>{session?.authenticated || session?.configured === false ? 'Tovább a rendeléshez' : 'Belépés és rendelés'}</button>
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
