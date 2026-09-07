import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import BrandLogo from '@/app/components/BrandLogo';
import ProductVisual from '@/app/components/ProductVisual';
import AddToCartButton from '@/app/components/AddToCartButton';
import { formatPrice, getProductBySlug } from '@/lib/products';
import { getProductsWithSettings } from '@/lib/product-catalog';
import { APP_VERSION } from '@/lib/version';
import { getFixedHeroForProduct } from '@/lib/hero-config';
import { getHeroMode } from '@/lib/site-settings';

const siteUrl = 'https://deli.doneisbetter.com';
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const item = getProductBySlug((await params).slug);
  if (!item) return {};
  const title = `${item.name} – dél-afrikai háttér, íz és felhasználás`;
  return { title, description: item.details.summary, alternates: { canonical: `/products/${item.slug}` }, openGraph: { title, description: item.details.summary, url: `/products/${item.slug}`, type: 'website', images: [item.image] } };
}

export default async function ProductPage({ params }) {
  const [catalog, heroMode] = await Promise.all([getProductsWithSettings(), getHeroMode()]);
  const { slug } = await params;
  const item = catalog.find((product) => product.slug === slug);
  if (!item) notFound();
  const related = catalog.filter((candidate) => candidate.category === item.category && candidate.id !== item.id).slice(0, 3);
  const productSchema = { '@context': 'https://schema.org', '@type': 'Product', name: item.name, image: `${siteUrl}${item.image}`, description: item.details.summary, sku: item.id, category: item.categoryName, url: `${siteUrl}/products/${item.slug}` };
  if (item.price != null) productSchema.offers = { '@type': 'Offer', priceCurrency: 'HUF', price: item.price, availability: 'https://schema.org/InStock', url: `${siteUrl}/products/${item.slug}` };
  const schemas = [
    productSchema,
    { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: item.details.faq.map(([question, answer]) => ({ '@type': 'Question', name: question, acceptedAnswer: { '@type': 'Answer', text: answer } })) },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Kezdőlap', item: siteUrl }, { '@type': 'ListItem', position: 2, name: item.categoryName, item: `${siteUrl}/categories/${item.category}` }, { '@type': 'ListItem', position: 3, name: item.name, item: `${siteUrl}/products/${item.slug}` }] }
  ];

  return <main className={`product-page category-${item.tone}`}>
    {schemas.map((schema, index) => <script key={index} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} />)}
    <header className="site-header product-header"><Link href="/" className="brand-link" aria-label="deli.africa kezdőlap"><BrandLogo /></Link><nav><Link href="/#shop">Shop</Link><Link href="/#story">Történet</Link></nav><Link className="button button-dark" href="/#shop">Vissza a shophoz</Link></header>
    <div className="product-breadcrumb"><Link href="/">Kezdőlap</Link><span>/</span><Link href={`/categories/${item.category}`}>{item.categoryName}</Link><span>/</span><span>{item.name}</span></div>
    <section className={`product-hero hero-mode-${heroMode}`}>{heroMode === 'fixed' && <Image className="fixed-hero-image" src={getFixedHeroForProduct(item)} alt={`${item.name} tálalási környezetben`} fill priority sizes="100vw" />}{heroMode === 'interactive' && <div className="product-hero-art"><ProductVisual product={item} large /></div>}<div className="product-hero-copy"><span className="badge inline">{item.badge}</span><p className="eyebrow dark">{item.categoryName}</p><h1>{item.name}</h1><p className="product-lead">{item.details.summary}</p><div className="product-buy"><strong>{formatPrice(item.price)}</strong>{item.price == null ? <button className="button button-muted" disabled>Hamarosan rendelhető</button> : <AddToCartButton productId={item.id} />}</div><p className="product-note">{item.details.info}</p></div></section>
    <section className="product-content">
      <div className="product-intro"><span className="eyebrow dark">ELSŐ KÓSTOLÁS ELŐTT</span><h2>Minden, ami a jó választáshoz kell.</h2></div>
      <figure className="product-editorial"><Image src={item.editorialImage} alt={`${item.name} tálalási ötlet`} fill sizes="(max-width: 650px) 100vw, 88vw"/><figcaption>{item.editorialCaption}</figcaption></figure>
      <div className="content-grid"><article><h2>Mi van a csomagban?</h2><p>{item.details.what}</p></article><article><h2>Miért dél-afrikai kedvenc?</h2><p>{item.details.background}</p></article><article><h2>Milyen ízre számíts?</h2><p>{item.details.flavour}</p></article><article><h2>Neked való, ha…</h2><p>{item.details.suits}</p></article></div>
      <div className="ideas-grid"><article><span className="eyebrow">FELHASZNÁLÁS</span><h2>Mivel párosítsd?</h2><ul>{item.details.uses.map((use) => <li key={use}>{use}</li>)}</ul></article><article><span className="eyebrow">TÁLALÁS</span><h2>Három gyors ötlet</h2><ol>{item.details.serving.map((idea) => <li key={idea}>{idea}</li>)}</ol></article></div>
      <article className="storage-card"><div><span className="eyebrow dark">JÓ, HA TUDOD</span><h2>Így marad a legjobb.</h2></div><div><p>{item.details.storage}</p><p>{item.details.info}</p></div></article>
      <section className="faq"><span className="eyebrow dark">GYAKORI KÉRDÉSEK</span><h2>Kérdések a {item.name} termékről</h2>{item.details.faq.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</section>
      {related.length > 0 && <section className="related"><span className="eyebrow dark">HA EZ TETSZIK</span><h2>Kóstolj még innen: {item.categoryName}</h2><div>{related.map((candidate) => <Link key={candidate.id} href={`/products/${candidate.slug}`}><span>{candidate.subtitle}</span><b>{candidate.name}</b><small>Megnézem közelebbről →</small></Link>)}</div></section>}
    </section>
    <footer><BrandLogo inverse /><p>Budapest · Hungary<br />deli.africa v{APP_VERSION}</p><div><Link href="/#shop">Shop</Link></div></footer>
  </main>;
}
