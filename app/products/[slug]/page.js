import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import BrandLogo from '@/app/components/BrandLogo';
import ProductVisual from '@/app/components/ProductVisual';
import AddToCartButton from '@/app/components/AddToCartButton';
import { formatPrice } from '@/lib/products';
import { getProductsWithSettings } from '@/lib/product-catalog';
import { getProductBySlug } from '@/lib/catalog-store';
import { getSiteSettings } from '@/lib/site-settings';
import { applyTemplate } from '@/lib/storefront-copy';

const siteUrl = 'https://deli.doneisbetter.com';
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const [{ slug }, settings] = await Promise.all([params, getSiteSettings()]);
  const item = await getProductBySlug(slug);
  if (!item) return {};
  const p = settings.uiCopy.productPage;
  const fallbackTitle = applyTemplate(settings.uiCopy.seo?.productTitleTemplate, { name: item.name });
  const title = item.seo?.title || fallbackTitle;
  const description = item.seo?.description || item.story || '';
  return {
    title,
    description,
    alternates: { canonical: `/products/${item.slug}` },
    openGraph: {
      title: item.seo?.ogTitle || title,
      description: item.seo?.ogDescription || description,
      url: `/products/${item.slug}`,
      type: 'website',
      images: item.image ? [item.image] : undefined
    },
    other: item.seo?.aiSummary ? { 'ai-summary': item.seo.aiSummary } : undefined
  };
}

export default async function ProductPage({ params }) {
  const [{ slug }, catalog, settings] = await Promise.all([params, getProductsWithSettings(), getSiteSettings()]);
  const item = catalog.find(product => product.slug === slug);
  if (!item) notFound();
  const copy = settings.uiCopy.productPage;
  const related = catalog.filter(candidate => candidate.category === item.category && candidate.id !== item.id).slice(0, 3);
  const faq = item.details.faq || [];
  const productSchema = {
    '@context': 'https://schema.org', '@type': 'Product', name: item.name,
    image: item.image ? `${siteUrl}${item.image}` : undefined,
    description: item.seo?.aiSummary || item.details.summary, sku: item.sku || item.id,
    brand: item.brand ? { '@type': 'Brand', name: item.brand } : undefined,
    category: item.categoryName, url: `${siteUrl}/products/${item.slug}`
  };
  if (item.price != null) productSchema.offers = { '@type': 'Offer', priceCurrency: item.currency || 'HUF', price: item.price, availability: item.purchasable === false ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock', url: `${siteUrl}/products/${item.slug}` };
  const schemas = [
    productSchema,
    ...(faq.length ? [{ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map(([question, answer]) => ({ '@type': 'Question', name: question, acceptedAnswer: { '@type': 'Answer', text: answer } })) }] : []),
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: copy.home, item: siteUrl },
      { '@type': 'ListItem', position: 2, name: item.categoryName, item: `${siteUrl}/categories/${item.category}` },
      { '@type': 'ListItem', position: 3, name: item.name, item: `${siteUrl}/products/${item.slug}` }
    ] }
  ];

  return <main className={`product-page category-${item.tone}`}>
    {schemas.map((schema,index)=><script key={index} type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema).replace(/</g,'\\u003c')}}/>)}
    <header className="site-header product-header"><Link href="/" className="brand-link" aria-label={settings.uiCopy.accessibility?.home}><BrandLogo /></Link><nav><Link href="/#shop">{copy.navShop}</Link><Link href="/#story">{copy.navStory}</Link></nav><Link className="button button-dark" href="/#shop">{copy.back}</Link></header>
    <div className="product-breadcrumb"><Link href="/">{copy.home}</Link><span>/</span><Link href={`/categories/${item.category}`}>{item.categoryName}</Link><span>/</span><span>{item.name}</span></div>
    <section className="product-hero"><div className="product-hero-art"><ProductVisual product={item} large /></div><div className="product-hero-copy"><span className="badge inline">{item.badge}</span><p className="eyebrow dark">{item.categoryName}</p><h1>{item.name}</h1><p className="product-lead">{item.details.summary}</p><div className="product-buy"><strong>{formatPrice(item.price)}</strong>{item.price==null||item.purchasable===false?<button className="button button-muted" disabled>{copy.unavailable}</button>:<AddToCartButton productId={item.id} label={copy.addToCart} addedLabel={copy.addedToCart}/>}</div>{item.details.info&&<p className="product-note">{item.details.info}</p>}</div></section>
    <section className="product-content">
      <div className="product-intro"><span className="eyebrow dark">{copy.introEyebrow}</span><h2>{copy.introTitle}</h2></div>
      {item.editorialImage&&<figure className="product-editorial"><Image src={item.editorialImage} alt={applyTemplate(copy.editorialAltTemplate,{name:item.name})} fill sizes="(max-width: 650px) 100vw, 88vw"/>{item.editorialCaption&&<figcaption>{item.editorialCaption}</figcaption>}</figure>}
      <div className="content-grid">
        {item.details.what&&<article><h2>{copy.packageTitle}</h2><p>{item.details.what}</p></article>}
        {item.details.background&&<article><h2>{copy.backgroundTitle}</h2><p>{item.details.background}</p></article>}
        {item.details.flavour&&<article><h2>{copy.flavourTitle}</h2><p>{item.details.flavour}</p></article>}
        {item.details.suits&&<article><h2>{copy.suitsTitle}</h2><p>{item.details.suits}</p></article>}
      </div>
      <div className="ideas-grid">
        {item.details.uses?.length>0&&<article><span className="eyebrow">{copy.usageEyebrow}</span><h2>{copy.pairingTitle}</h2><ul>{item.details.uses.map(use=><li key={use}>{use}</li>)}</ul></article>}
        {item.details.serving?.length>0&&<article><span className="eyebrow">{copy.servingEyebrow}</span><h2>{copy.servingTitle}</h2><ol>{item.details.serving.map(idea=><li key={idea}>{idea}</li>)}</ol></article>}
      </div>
      {(item.details.storage||item.details.info)&&<article className="storage-card"><div><span className="eyebrow dark">{copy.storageEyebrow}</span><h2>{copy.storageTitle}</h2></div><div>{item.details.storage&&<p>{item.details.storage}</p>}{item.details.info&&<p>{item.details.info}</p>}</div></article>}
      {faq.length>0&&<section className="faq"><span className="eyebrow dark">{copy.faqEyebrow}</span><h2>{applyTemplate(copy.faqTitleTemplate,{name:item.name})}</h2>{faq.map(([question,answer])=><details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</section>}
      {related.length>0&&<section className="related"><span className="eyebrow dark">{copy.relatedEyebrow}</span><h2>{applyTemplate(copy.relatedTitleTemplate,{category:item.categoryName})}</h2><div>{related.map(candidate=><Link key={candidate.id} href={`/products/${candidate.slug}`}><span>{candidate.subtitle}</span><b>{candidate.name}</b><small>{copy.relatedLink}</small></Link>)}</div></section>}
    </section>
  </main>;
}
