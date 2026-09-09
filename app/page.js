'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { categories, products, formatPrice } from '@/lib/products';
import ProductVisual from '@/app/components/ProductVisual';
import BrandLogo from '@/app/components/BrandLogo';
import { DEFAULT_HERO_MODE, fixedHeroByCategory, homepageFixedHeroes } from '@/lib/hero-config';
import { DEFAULT_STOREFRONT_CONTENT } from '@/lib/site-config';
import { DEFAULT_STOREFRONT_UI_COPY } from '@/lib/storefront-copy';

const heroScenes = [
  { category: 'braai', image: '/hero-scenes/braai.webp' },
  { category: 'spices', image: '/hero-scenes/spices.webp' },
  { category: 'pate', image: '/hero-scenes/pate.webp' },
  { category: 'tea', image: '/hero-scenes/tea.webp' },
  { category: 'snacks', image: '/hero-scenes/snacks.webp' }
];

function savedAddress(address = {}) {
  return [address.postalCode, address.city, address.addressLine1, address.addressLine2, address.country].map(value => String(value || '').trim()).filter(Boolean).join(', ');
}

export default function Home() {
  const [catalog, setCatalog] = useState(products);
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
  const [heroMode, setHeroMode] = useState(DEFAULT_HERO_MODE);
  const [fixedHeroIndex, setFixedHeroIndex] = useState(0);
  const [categorySelectorMode, setCategorySelectorMode] = useState('fixed');
  const [storefrontContent, setStorefrontContent] = useState(DEFAULT_STOREFRONT_CONTENT);
  const [uiCopy, setUiCopy] = useState(DEFAULT_STOREFRONT_UI_COPY);
  const [checkoutEnabled, setCheckoutEnabled] = useState(true);
  const cartReady = useRef(false);

  useEffect(() => {
    const saved = window.localStorage.getItem('deli-cart');
    if (saved) { try { setCart(JSON.parse(saved)); } catch { window.localStorage.removeItem('deli-cart'); } }
    cartReady.current = true;
    fetch('/api/auth/session', { cache: 'no-store' }).then((res) => res.json()).then((data) => {
      setSession(data);
      if (data.authenticated) {
        setForm((current) => ({ ...current, customerName: data.user.name || current.customerName, email: data.user.email || current.email }));
        fetch('/api/profile', { cache:'no-store' }).then(res => res.ok ? res.json() : null).then(profileData => {
          if (!profileData?.profile) return;
          const profile = profileData.profile;
          const address = savedAddress(profile.shippingAddress);
          setForm(current => ({
            ...current,
            customerName: profile.shippingAddress?.recipientName || profile.name || current.customerName,
            email: profile.email || current.email,
            phone: profile.shippingAddress?.phone || profile.phone || current.phone,
            address: address || current.address
          }));
        }).catch(() => {});
      }
    }).catch(() => setSession({ authenticated: false }));
    fetch('/api/catalog', { cache: 'no-store' }).then(res => res.json()).then(data => {
      if (Array.isArray(data.products) && data.products.length) setCatalog(data.products);
    }).catch(() => {});
    fetch('/api/site-settings', { cache: 'no-store' }).then((res) => res.json()).then((data) => {
      setHeroMode(data.heroMode || DEFAULT_HERO_MODE);
      setCategorySelectorMode(data.categorySelectorMode || 'fixed');
      setStorefrontContent({ ...DEFAULT_STOREFRONT_CONTENT, ...(data.storefrontContent || {}) });
      setUiCopy(data.uiCopy || DEFAULT_STOREFRONT_UI_COPY);
      setCheckoutEnabled(data.sales?.checkoutEnabled !== false);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (heroMode !== 'fixed' || homepageFixedHeroes.length < 2) return undefined;
    const rotation = window.setInterval(() => setFixedHeroIndex((current) => (current + 1) % homepageFixedHeroes.length), 7000);
    return () => window.clearInterval(rotation);
  }, [heroMode]);

  useEffect(() => { if (cartReady.current) window.localStorage.setItem('deli-cart', JSON.stringify(cart)); }, [cart]);

  useEffect(() => {
    if (!catalog.length) return;
    const scene = heroScenes[Math.floor(Math.random() * heroScenes.length)];
    const shuffled = [...catalog.filter(product => product.category === scene.category)];
    for (let index = shuffled.length - 1; index > 0; index--) {
      const swapWith = Math.floor(Math.random() * (index + 1));
      [shuffled[index], shuffled[swapWith]] = [shuffled[swapWith], shuffled[index]];
    }
    setHeroScene(scene);
    setHeroProducts(shuffled.slice(0, 1));
  }, [catalog]);

  const shown = useMemo(() => category === 'all' ? catalog : catalog.filter(p => p.category === category), [category, catalog]);
  const cartRows = Object.entries(cart).map(([id, quantity]) => ({ product: catalog.find(p => p.id === id), quantity })).filter(r => r.product);
  const cartCount = cartRows.reduce((s, r) => s + r.quantity, 0);
  const total = cartRows.reduce((s, r) => s + (r.product.price || 0) * r.quantity, 0);

  function add(id) { setCart(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 })); setCartOpen(true); }
  function setQty(id, qty) { setCart(prev => { const next = { ...prev }; if (qty <= 0) delete next[id]; else next[id] = qty; return next; }); }

  async function placeOrder(e) {
    e.preventDefault(); setOrderState({ loading: true });
    const res = await fetch('/api/orders', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ...form, items: cartRows.map(r => ({ productId: r.product.id, quantity: r.quantity })) }) });
    const data = await res.json(); setOrderState(data);
    if (data.ok) { setCart({}); setCheckout(false); }
  }

  function beginCheckout() {
    if (!checkoutEnabled) return;
    if (session?.configured === false) { setCartOpen(false); setCheckout(true); return; }
    if (!session?.authenticated) { window.localStorage.setItem('deli-cart', JSON.stringify(cart)); window.location.assign('/api/auth/login?returnTo=%2F%23shop'); return; }
    setCartOpen(false); setCheckout(true);
  }

  return <main>
    <header className="site-header">
      <a href="#top" className="brand-link" aria-label={uiCopy.accessibility?.home}><BrandLogo /></a>
      <nav><a href="#shop">{uiCopy.nav.shop}</a><a href="#story">{uiCopy.nav.story}</a><a href="#why">{uiCopy.nav.why}</a>{session?.permission?.status === 'approved' && session?.permission?.role === 'admin' && <Link href="/dashboard">{uiCopy.nav.dashboard}</Link>}</nav>
      <div className="header-actions">{session?.authenticated ? <Link className="account-link" href="/profile" title={uiCopy.nav.profile}>{session.user.name}</Link> : <a className="account-link" href="/api/auth/login?returnTo=%2F%23shop">{uiCopy.nav.login}</a>}<button className="cart-button" onClick={() => setCartOpen(true)}>{uiCopy.nav.cart} <span>{cartCount}</span></button></div>
    </header>

    <section className={`hero hero-mode-${heroMode}`} id="top">
      {heroMode === 'fixed' && <Image key={homepageFixedHeroes[fixedHeroIndex]} className="fixed-hero-image fixed-hero-image-rotating" src={homepageFixedHeroes[fixedHeroIndex]} alt="" fill priority={fixedHeroIndex === 0} sizes="100vw" />}
      <div className="hero-copy"><div className="eyebrow">{storefrontContent.heroEyebrow}</div><h1>{storefrontContent.heroTitle.split('\n').map((line) => <span key={line}>{line}<br/></span>)}</h1><p>{storefrontContent.heroBody}</p><a className="button button-red" href="#shop">{storefrontContent.heroButton}</a></div>
      {heroMode === 'interactive' && <div className={`hero-stage hero-category-${heroScene.category}`} style={{ backgroundImage: `url(${heroScene.image})` }}><div className="sun-disc"/><div className={`hero-products hero-products-${heroProducts.length}`}>{heroProducts.map((product,index)=><ProductVisual product={product} hero large className={`hero-product hero-count-${heroProducts.length} hero-product-${index+1}`} key={product.id}/>)}</div><div className="spice-sweep"/></div>}
    </section>

    <section className="story-block" id="story"><div><span className="eyebrow dark">{storefrontContent.storyLabel}</span><h2>{storefrontContent.storyTitle}</h2></div><div className="story-copy">{storefrontContent.storyBody.split(/\n\n+/).map(paragraph=><p key={paragraph}>{paragraph}</p>)}<a className="story-link" href="#shop">{uiCopy.story.link}</a></div></section>
    <section className="why-block" id="why"><div className="why-heading"><span className="eyebrow">{storefrontContent.whyLabel}</span><h2>{storefrontContent.whyTitle.split('\n').map(line=><span key={line}>{line}<br/></span>)}</h2><p>{storefrontContent.whyBody}</p></div><div className="why-grid">{(uiCopy.why.cards||[]).map(card=><article key={card.number}><b>{card.number}</b><h3>{card.title}</h3><p>{card.body}</p></article>)}</div></section>

    <section className="shop" id="shop">
      <div className="section-head"><div><span className="eyebrow dark">{uiCopy.shop.eyebrow}</span><h2>{uiCopy.shop.title}</h2></div><button className={`category-reset ${category==='all'?'active':''}`} onClick={()=>setCategory('all')}>{uiCopy.shop.allProducts}</button></div>
      <div className={`category-selector mode-${categorySelectorMode}`} aria-label={uiCopy.shop.title}>{categories.filter(c=>c.id!=='all').map(c=>{const cc=uiCopy.categories?.[c.id]||{};const lines=[cc.visualLine1,cc.visualLine2].filter(Boolean);return <div className={`category-tile ${c.tone} ${category===c.id?'active':''}`} key={c.id}><button onClick={()=>setCategory(c.id)} aria-pressed={category===c.id}><span>{(lines.length?lines:c.visualLabel).map(line=><b key={line}>{line}</b>)}</span><Image src={categorySelectorMode==='fixed'?fixedHeroByCategory[c.id]:c.image} alt={cc.label||c.label} fill sizes="(max-width: 650px) 62vw, 17vw"/></button><Link href={`/categories/${c.id}`}>{uiCopy.shop.categoryIntro}</Link></div>;})}</div>
      <div className="product-grid">{shown.map(product=><article className="product-card" key={product.id}><button className={`visual-button tone-${product.tone}`} onClick={()=>setDetail(product)}><ProductVisual product={product}/><span className="badge">{product.badge}</span></button><div className="product-info"><small>{product.subtitle}</small><h3>{product.name}</h3><p>{product.story}</p><div className="product-bottom"><strong>{formatPrice(product.price)}</strong><button disabled={product.price==null} onClick={()=>add(product.id)}>{product.price==null?uiCopy.shop.unavailable:'+'}</button></div></div></article>)}</div>
    </section>

    <section className="editorial">{(uiCopy.editorial||[]).map((item,index)=><div className={`editorial-card ${['red','olive','fig','mango'][index]||'red'}`} key={`${item.label}-${index}`}><span>{item.label}</span><b>{item.title}</b></div>)}</section>

    {detail && <div className="modal-backdrop" onClick={()=>setDetail(null)}><div className={`detail-modal category-${detail.category}`} onClick={e=>e.stopPropagation()}><button className="close" aria-label={uiCopy.accessibility?.close} onClick={()=>setDetail(null)}>×</button><ProductVisual product={detail} large/><div><span className="badge inline">{detail.badge}</span><h2>{detail.name}</h2><p>{detail.story}</p><strong>{formatPrice(detail.price)}</strong><div className="modal-actions">{detail.price!=null&&<button className="button button-red" onClick={()=>{add(detail.id);setDetail(null);}}>{uiCopy.modal.addToCart}</button>}<Link className="button button-outline" href={`/products/${detail.slug}`}>{uiCopy.modal.knowMore}</Link></div></div></div></div>}

    <aside className={`cart-drawer ${cartOpen?'open':''}`}><div className="drawer-head"><h2>{uiCopy.cart.title}</h2><button aria-label={uiCopy.accessibility?.close} onClick={()=>setCartOpen(false)}>×</button></div>{cartRows.length===0?<div className="empty-cart">{uiCopy.cart.empty}<button className="button button-dark" onClick={()=>setCartOpen(false)}>{uiCopy.cart.continueShopping}</button></div>:<><div className="cart-lines">{cartRows.map(({product,quantity})=><div className="cart-line" key={product.id}><ProductVisual product={product}/><div><b>{product.name}</b><span>{formatPrice(product.price)}</span><div className="qty"><button aria-label={uiCopy.accessibility?.cartDecrease} onClick={()=>setQty(product.id,quantity-1)}>−</button><span>{quantity}</span><button aria-label={uiCopy.accessibility?.cartIncrease} onClick={()=>setQty(product.id,quantity+1)}>+</button></div></div></div>)}</div><div className="cart-total"><span>{uiCopy.cart.total}</span><strong>{formatPrice(total)}</strong></div><button className="button button-red full" disabled={!checkoutEnabled} onClick={beginCheckout}>{!checkoutEnabled?uiCopy.cart.disabled:session?.authenticated||session?.configured===false?uiCopy.cart.checkout:uiCopy.cart.loginCheckout}</button></>}</aside>
    {cartOpen&&<button className="drawer-overlay" aria-label={uiCopy.accessibility?.close} onClick={()=>setCartOpen(false)}/>}

    {checkout&&<div className="modal-backdrop"><form className="checkout-modal" onSubmit={placeOrder}><button type="button" className="close" aria-label={uiCopy.accessibility?.close} onClick={()=>setCheckout(false)}>×</button><span className="eyebrow dark">{uiCopy.checkout.title}</span><h2>{uiCopy.checkout.title}</h2><div className="form-grid"><label>{uiCopy.checkout.name}<input required value={form.customerName} onChange={e=>setForm({...form,customerName:e.target.value})}/></label><label>{uiCopy.checkout.email}<input required type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></label><label>{uiCopy.checkout.phone}<input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/></label><label className="wide">{uiCopy.checkout.address}<textarea required value={form.address} onChange={e=>setForm({...form,address:e.target.value})}/></label></div><div className="cart-total"><span>{uiCopy.cart.total}</span><strong>{formatPrice(total)}</strong></div><button className="button button-red full" disabled={orderState?.loading}>{orderState?.loading?`${uiCopy.checkout.submit}…`:uiCopy.checkout.submit}</button>{orderState&&!orderState.loading&&!orderState.ok&&<p className="form-error">{orderState.error}</p>}</form></div>}
    {orderState?.ok&&<div className="order-toast"><b>{uiCopy.checkout.success}</b><span>{orderState.reference}</span><small>{orderState.message}</small><button aria-label={uiCopy.accessibility?.close} onClick={()=>setOrderState(null)}>×</button></div>}
  </main>;
}
