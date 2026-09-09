import { Anchor, BodyText, Button, GdsInline, GdsStack, MetadataText, PageTitle, SectionTitle } from "@/app/components/gds";
import Link from 'next/link';
import { MediaWithFallback } from '@/app/components/gds';
import { notFound } from 'next/navigation';
import BrandLogo from '@/app/components/BrandLogo';
import ProductVisual from '@/app/components/ProductVisual';
import AddToCartButton from '@/app/components/AddToCartButton';
import { categories, formatPrice } from '@/lib/products';
import { getProductsWithSettings } from '@/lib/product-catalog';
import { fixedHeroByCategory } from '@/lib/hero-config';
import { getSiteSettings } from '@/lib/site-settings';
import { applyTemplate } from '@/lib/storefront-copy';
const siteUrl = 'https://deli.doneisbetter.com';
export const dynamic = 'force-dynamic';
const heroScenes = {
  braai: '/hero-scenes/braai.webp',
  spices: '/hero-scenes/spices.webp',
  pate: '/hero-scenes/pate.webp',
  tea: '/hero-scenes/tea.webp',
  snacks: '/hero-scenes/snacks.webp',
  pantry: '/hero-scenes/pantry.webp'
};
export async function generateMetadata({
  params
}) {
  const [{
    slug
  }, settings] = await Promise.all([params, getSiteSettings()]);
  const data = settings.uiCopy.categories?.[slug];
  if (!data) return {};
  return {
    title: data.title,
    description: data.lead,
    alternates: {
      canonical: `/categories/${slug}`
    }
  };
}
export default async function CategoryPage({
  params
}) {
  const [{
    slug
  }, catalog, settings] = await Promise.all([params, getProductsWithSettings(), getSiteSettings()]);
  const category = categories.find(item => item.id === slug);
  const data = settings.uiCopy.categories?.[slug];
  const copy = settings.uiCopy.categoryPage;
  const productCopy = settings.uiCopy.productPage;
  if (!category || !data) notFound();
  const items = catalog.filter(product => product.category === slug);
  const schemas = [{
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: data.title,
    description: data.lead,
    url: `${siteUrl}/categories/${slug}`
  }, {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `${siteUrl}/products/${item.slug}`,
      name: item.name
    }))
  }, {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [{
      '@type': 'ListItem',
      position: 1,
      name: copy.home,
      item: siteUrl
    }, {
      '@type': 'ListItem',
      position: 2,
      name: data.label,
      item: `${siteUrl}/categories/${slug}`
    }]
  }];
  return <GdsStack component="main" gap="md" padding="md">
    {schemas.map((schema, index) => <script key={index} type="application/ld+json" dangerouslySetInnerHTML={{
      __html: JSON.stringify(schema).replace(/</g, '\\u003c')
    }} />)}
    <GdsInline component="header" gap="md" padding="md"><Anchor href="/" aria-label={settings.uiCopy.accessibility?.home}><BrandLogo /></Anchor><GdsInline component="nav" gap="md"><Anchor href="/#shop">{copy.navShop}</Anchor><Anchor href="/#story">{copy.navStory}</Anchor></GdsInline><Anchor href="/#shop">{copy.allProducts}</Anchor></GdsInline>
    <GdsStack gap="md"><Anchor href="/">{copy.home}</Anchor><span>/</span><span>{data.label}</span></GdsStack>
    <GdsStack component="section" gap="md" padding="md">{settings.heroMode === 'fixed' && <MediaWithFallback src={fixedHeroByCategory[slug]} alt={applyTemplate(copy.heroAltTemplate, {
        category: data.label
      })} showShimmer={false} />}<GdsStack gap="md"><span>{applyTemplate(settings.uiCopy.shop.categoryCountTemplate, {
            count: items.length
          })}</span><PageTitle>{data.title}</PageTitle><BodyText>{data.lead}</BodyText></GdsStack>{settings.heroMode === 'interactive' && <GdsStack gap="md">{items[0] && <ProductVisual product={items[0]} hero large />}</GdsStack>}</GdsStack>
    <GdsStack component="section" gap="md" padding="md"><GdsStack gap="md"><span>{copy.whyEyebrow}</span><SectionTitle order={2}>{copy.whyTitle}</SectionTitle></GdsStack><GdsStack gap="md"><BodyText>{data.context}</BodyText><strong>{data.tip}</strong></GdsStack></GdsStack>
    <GdsStack component="section" gap="md" padding="md"><span>{copy.productsEyebrow}</span><SectionTitle order={2}>{copy.productsTitle}</SectionTitle><GdsStack gap="md">{items.map(item => <GdsStack key={item.id} component="article" gap="md" padding="md"><Anchor href={`/products/${item.slug}`}><ProductVisual product={item} /><MetadataText>{item.subtitle}</MetadataText><SectionTitle order={3}>{item.name}</SectionTitle><BodyText>{item.story}</BodyText></Anchor><GdsInline gap="md"><b>{formatPrice(item.price)}</b>{item.price == null || item.purchasable === false ? <Button disabled type="button">{copy.unavailable}</Button> : <AddToCartButton productId={item.id} label={productCopy.addToCart} addedLabel={productCopy.addedToCart} />}</GdsInline><Anchor href={`/products/${item.slug}`}>{copy.detailsLink}</Anchor></GdsStack>)}</GdsStack></GdsStack>
  </GdsStack>;
}
