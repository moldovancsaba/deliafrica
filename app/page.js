'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Anchor, Button, GdsContainer, GdsStack, GdsInline, GdsBox, PageTitle, SectionTitle, BodyText, MetadataText, SectionPanel, PublicProductCard, MediaWithFallback, Modal, GdsDrawer, NumberStepper, TextInput, Textarea, SimpleGrid } from '@sovereignsquad/gds/client';
import { categories, products, formatPrice } from '@/lib/products';
import ProductVisual from '@/app/components/ProductVisual';
import { DEFAULT_HERO_MODE, fixedHeroByCategory, homepageFixedHeroes } from '@/lib/hero-config';
import { DEFAULT_STOREFRONT_CONTENT } from '@/lib/site-config';
import { DEFAULT_STOREFRONT_UI_COPY } from '@/lib/storefront-copy';
const heroScenes = [{
  category: 'braai',
  image: '/hero-scenes/braai.webp'
}, {
  category: 'spices',
  image: '/hero-scenes/spices.webp'
}, {
  category: 'pate',
  image: '/hero-scenes/pate.webp'
}, {
  category: 'tea',
  image: '/hero-scenes/tea.webp'
}, {
  category: 'snacks',
  image: '/hero-scenes/snacks.webp'
}];
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
  const [form, setForm] = useState({
    customerName: '',
    email: '',
    phone: '',
    address: ''
  });
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
    if (saved) {
      try {
        setCart(JSON.parse(saved));
      } catch {
        window.localStorage.removeItem('deli-cart');
      }
    }
    cartReady.current = true;
    fetch('/api/auth/session', {
      cache: 'no-store'
    }).then(res => res.json()).then(data => {
      setSession(data);
      if (data.authenticated) {
        setForm(current => ({
          ...current,
          customerName: data.user.name || current.customerName,
          email: data.user.email || current.email
        }));
        fetch('/api/profile', {
          cache: 'no-store'
        }).then(res => res.ok ? res.json() : null).then(profileData => {
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
    }).catch(() => setSession({
      authenticated: false
    }));
    fetch('/api/catalog', {
      cache: 'no-store'
    }).then(res => res.json()).then(data => {
      if (Array.isArray(data.products) && data.products.length) setCatalog(data.products);
    }).catch(() => {});
    fetch('/api/site-settings', {
      cache: 'no-store'
    }).then(res => res.json()).then(data => {
      setHeroMode(data.heroMode || DEFAULT_HERO_MODE);
      setCategorySelectorMode(data.categorySelectorMode || 'fixed');
      setStorefrontContent({
        ...DEFAULT_STOREFRONT_CONTENT,
        ...(data.storefrontContent || {})
      });
      setUiCopy(data.uiCopy || DEFAULT_STOREFRONT_UI_COPY);
      setCheckoutEnabled(data.sales?.checkoutEnabled !== false);
    }).catch(() => {});
  }, []);
  useEffect(() => {
    if (heroMode !== 'fixed' || homepageFixedHeroes.length < 2) return undefined;
    const rotation = window.setInterval(() => setFixedHeroIndex(current => (current + 1) % homepageFixedHeroes.length), 7000);
    return () => window.clearInterval(rotation);
  }, [heroMode]);
  useEffect(() => {
    if (cartReady.current) window.localStorage.setItem('deli-cart', JSON.stringify(cart));
  }, [cart]);
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
  const cartRows = Object.entries(cart).map(([id, quantity]) => ({
    product: catalog.find(p => p.id === id),
    quantity
  })).filter(r => r.product);
  const cartCount = cartRows.reduce((s, r) => s + r.quantity, 0);
  const total = cartRows.reduce((s, r) => s + (r.product.price || 0) * r.quantity, 0);
  function add(id) {
    setCart(prev => ({
      ...prev,
      [id]: (prev[id] || 0) + 1
    }));
    setCartOpen(true);
  }
  function setQty(id, qty) {
    setCart(prev => {
      const next = {
        ...prev
      };
      if (qty <= 0) delete next[id];else next[id] = qty;
      return next;
    });
  }
  async function placeOrder(e) {
    e.preventDefault();
    if (orderState?.loading) return;
    setOrderState({
      loading: true
    });
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        signal: AbortSignal.timeout(20000),
        body: JSON.stringify({
          ...form,
          items: cartRows.map(r => ({
            productId: r.product.id,
            quantity: r.quantity
          }))
        })
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || 'A rendelés nem sikerült. Kérjük, próbáld újra.');
      setOrderState(data);
      setCart({});
      setCheckout(false);
    } catch (error) {
      setOrderState({
        ok: false,
        error: error.name === 'TimeoutError' ? 'A válasz túl sokáig tartott. Ellenőrizd a rendeléseidet az újraküldés előtt.' : error.message || 'Hálózati hiba. Kérjük, próbáld újra.'
      });
    }
  }
  function beginCheckout() {
    if (!checkoutEnabled) return;
    if (session?.configured === false) {
      setCartOpen(false);
      setCheckout(true);
      return;
    }
    if (!session?.authenticated) {
      window.localStorage.setItem('deli-cart', JSON.stringify(cart));
      window.location.assign('/api/auth/login?returnTo=%2F%23shop');
      return;
    }
    setCartOpen(false);
    setCheckout(true);
  }
  return <GdsContainer component="main" size="page" padding="md">
    <GdsStack gap="xl">
      <GdsInline component="header" gap="md" justify="between" align="center">
        <Anchor href="#top" aria-label={uiCopy.accessibility?.home}>deli.africa</Anchor>
        <GdsInline component="nav" gap="md" aria-label={uiCopy.nav.shop}>
          <Anchor href="#shop">{uiCopy.nav.shop}</Anchor><Anchor href="#story">{uiCopy.nav.story}</Anchor><Anchor href="#why">{uiCopy.nav.why}</Anchor>
          {session?.permission?.status === 'approved' && session?.permission?.role === 'admin' && <Anchor href="/dashboard">{uiCopy.nav.dashboard}</Anchor>}
          <Anchor href={session?.authenticated ? '/profile' : '/api/auth/login?returnTo=%2F%23shop'}>{session?.authenticated ? session.user.name : uiCopy.nav.login}</Anchor>
          <Button onClick={() => setCartOpen(true)}>{uiCopy.nav.cart} ({cartCount})</Button>
        </GdsInline>
      </GdsInline>
      <SimpleGrid component="section" id="top" spacing="xl" align="center" cols={{
        base: 1,
        md: 2
      }}>
        <GdsStack gap="md"><MetadataText>{storefrontContent.heroEyebrow}</MetadataText><PageTitle>{storefrontContent.heroTitle}</PageTitle><BodyText>{storefrontContent.heroBody}</BodyText><Button component="a" href="#shop">{storefrontContent.heroButton}</Button></GdsStack>
        {heroMode === 'fixed' ? <MediaWithFallback src={homepageFixedHeroes[fixedHeroIndex]} alt="" showShimmer={false} /> : <GdsStack gap="md">{heroProducts.map(product => <ProductVisual key={product.id} product={product} hero />)}</GdsStack>}
      </SimpleGrid>
      <SectionPanel id="story" eyebrow={storefrontContent.storyLabel} title={storefrontContent.storyTitle}><GdsStack gap="md">{storefrontContent.storyBody.split(/\n\n+/).map(paragraph => <BodyText key={paragraph}>{paragraph}</BodyText>)}<Anchor href="#shop">{uiCopy.story.link}</Anchor></GdsStack></SectionPanel>
      <SectionPanel id="why" eyebrow={storefrontContent.whyLabel} title={storefrontContent.whyTitle} description={storefrontContent.whyBody}><SimpleGrid cols={{
          base: 1,
          md: 2
        }} spacing="md">{(uiCopy.why.cards || []).map(card => <SectionPanel key={card.number} title={card.title}><BodyText>{card.body}</BodyText></SectionPanel>)}</SimpleGrid></SectionPanel>
      <GdsStack component="section" id="shop" gap="lg">
        <SectionTitle>{uiCopy.shop.title}</SectionTitle>
        <GdsInline gap="sm"><Button variant={category === 'all' ? 'filled' : 'default'} aria-pressed={category === 'all'} onClick={() => setCategory('all')}>{uiCopy.shop.allProducts}</Button>{categories.filter(c => c.id !== 'all').map(c => <Button key={c.id} variant={category === c.id ? 'filled' : 'default'} aria-pressed={category === c.id} onClick={() => setCategory(c.id)}>{uiCopy.categories?.[c.id]?.label || c.label}</Button>)}</GdsInline>
        <SimpleGrid cols={{
          base: 1,
          sm: 2,
          lg: 3
        }} spacing="lg">{categories.filter(c => c.id !== 'all').map(c => <GdsStack key={c.id} gap="sm"><MediaWithFallback src={categorySelectorMode === 'fixed' ? fixedHeroByCategory[c.id] : c.image} alt={uiCopy.categories?.[c.id]?.label || c.label} showShimmer={false} /><Anchor href={`/categories/${c.id}`}>{uiCopy.categories?.[c.id]?.label || c.label} · {uiCopy.shop.categoryIntro}</Anchor></GdsStack>)}</SimpleGrid>
        <SimpleGrid cols={{
          base: 1,
          sm: 2,
          lg: 3
        }} spacing="lg">{shown.map(product => <PublicProductCard key={product.id} title={product.name} description={product.story} image={<ProductVisual product={product} />} price={formatPrice(product.price)} state={product.price == null ? 'sold-out' : 'available'} stateLabels={{
            'sold-out': uiCopy.shop.unavailable,
            available: product.badge || uiCopy.modal.addToCart
          }} primaryAction={<Button disabled={product.price == null} onClick={() => add(product.id)} aria-label={`${uiCopy.modal.addToCart}: ${product.name}`}>{uiCopy.modal.addToCart}</Button>} secondaryAction={<Button variant="default" onClick={() => setDetail(product)}>{uiCopy.modal.knowMore}</Button>} />)}</SimpleGrid>
      </GdsStack>
      <SimpleGrid cols={{
        base: 1,
        md: 2
      }} spacing="md">{(uiCopy.editorial || []).map((item, index) => <SectionPanel key={index} eyebrow={item.label} title={item.title}><></></SectionPanel>)}</SimpleGrid>
    </GdsStack>
    <Modal opened={Boolean(detail)} onClose={() => setDetail(null)} title={detail?.name} closeButtonProps={{
      'aria-label': uiCopy.accessibility?.close
    }}>{detail && <GdsStack gap="md"><ProductVisual product={detail} /><BodyText>{detail.story}</BodyText><BodyText>{formatPrice(detail.price)}</BodyText><GdsInline gap="md">{detail.price != null && <Button onClick={() => {
            add(detail.id);
            setDetail(null);
          }}>{uiCopy.modal.addToCart}</Button>}<Button component="a" variant="default" href={`/products/${detail.slug}`}>{uiCopy.modal.knowMore}</Button></GdsInline></GdsStack>}</Modal>
    <GdsDrawer id="shopping-cart" opened={cartOpen} onClose={() => setCartOpen(false)} title={uiCopy.cart.title} position="right" closeButtonProps={{
      'aria-label': uiCopy.accessibility?.close
    }}><GdsStack gap="lg">{cartRows.length === 0 ? <><BodyText>{uiCopy.cart.empty}</BodyText><Button onClick={() => setCartOpen(false)}>{uiCopy.cart.continueShopping}</Button></> : <>{cartRows.map(({
            product,
            quantity
          }) => <SectionPanel key={product.id} title={product.name}><GdsStack gap="sm"><BodyText>{formatPrice(product.price)}</BodyText><NumberStepper value={quantity} min={0} max={999} onChange={value => setQty(product.id, value)} ariaLabel={product.name} decrementLabel={uiCopy.accessibility?.cartDecrease} incrementLabel={uiCopy.accessibility?.cartIncrease} /></GdsStack></SectionPanel>)}<BodyText>{uiCopy.cart.total}: {formatPrice(total)}</BodyText><Button disabled={!checkoutEnabled} onClick={beginCheckout}>{!checkoutEnabled ? uiCopy.cart.disabled : session?.authenticated || session?.configured === false ? uiCopy.cart.checkout : uiCopy.cart.loginCheckout}</Button></>}</GdsStack></GdsDrawer>
    <Modal opened={checkout} onClose={() => {
      if (!orderState?.loading) setCheckout(false);
    }} title={uiCopy.checkout.title} closeButtonProps={{
      'aria-label': uiCopy.accessibility?.close
    }}><GdsStack component="form" onSubmit={placeOrder} gap="md"><TextInput label={uiCopy.checkout.name} required autoComplete="name" value={form.customerName} onChange={e => setForm({
          ...form,
          customerName: e.target.value
        })} /><TextInput label={uiCopy.checkout.email} required type="email" autoComplete="email" value={form.email} onChange={e => setForm({
          ...form,
          email: e.target.value
        })} /><TextInput label={uiCopy.checkout.phone} type="tel" autoComplete="tel" value={form.phone} onChange={e => setForm({
          ...form,
          phone: e.target.value
        })} /><Textarea label={uiCopy.checkout.address} required autoComplete="street-address" value={form.address} onChange={e => setForm({
          ...form,
          address: e.target.value
        })} /><BodyText>{uiCopy.cart.total}: {formatPrice(total)}</BodyText><Button type="submit" loading={orderState?.loading}>{uiCopy.checkout.submit}</Button>{orderState && !orderState.loading && !orderState.ok && <GdsBox role="alert"><BodyText>{orderState.error}</BodyText></GdsBox>}</GdsStack></Modal>
    <Modal opened={Boolean(orderState?.ok)} onClose={() => setOrderState(null)} title={uiCopy.checkout.success} closeButtonProps={{
      'aria-label': uiCopy.accessibility?.close
    }}><GdsStack gap="md"><BodyText>{orderState?.reference}</BodyText><BodyText>{orderState?.message}</BodyText></GdsStack></Modal>
  </GdsContainer>;
}
