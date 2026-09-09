import ProductFaq from '@/app/components/ProductFaq';
import { Anchor, BodyText, Button, GdsInline, GdsStack, MetadataText, PageTitle, SectionTitle, SimpleGrid } from "@/app/components/gds";
import Link from 'next/link';
import { MediaWithFallback } from '@/app/components/gds';
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
export async function generateMetadata({
  params
}) {
  const [{
    slug
  }, settings] = await Promise.all([params, getSiteSettings()]);
  const item = await getProductBySlug(slug);
  if (!item) return {};
  const p = settings.uiCopy.productPage;
  const fallbackTitle = applyTemplate(settings.uiCopy.seo?.productTitleTemplate, {
    name: item.name
  });
  const title = item.seo?.title || fallbackTitle;
  const description = item.seo?.description || item.story || '';
  return {
    title,
    description,
    alternates: {
      canonical: `/products/${item.slug}`
    },
    openGraph: {
      title: item.seo?.ogTitle || title,
      description: item.seo?.ogDescription || description,
      url: `/products/${item.slug}`,
      type: 'website',
      images: item.image ? [item.image] : undefined
    },
    other: item.seo?.aiSummary ? {
      'ai-summary': item.seo.aiSummary
    } : undefined
  };
}
export default async function ProductPage({
  params
}) {
  const [{
    slug
  }, catalog, settings] = await Promise.all([params, getProductsWithSettings(), getSiteSettings()]);
  const item = catalog.find(product => product.slug === slug);
  if (!item) notFound();
  const copy = settings.uiCopy.productPage;
  const related = catalog.filter(candidate => candidate.category === item.category && candidate.id !== item.id).slice(0, 3);
  const faq = item.details.faq || [];
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: item.name,
    image: item.image ? `${siteUrl}${item.image}` : undefined,
    description: item.seo?.aiSummary || item.details.summary,
    sku: item.sku || item.id,
    brand: item.brand ? {
      '@type': 'Brand',
      name: item.brand
    } : undefined,
    category: item.categoryName,
    url: `${siteUrl}/products/${item.slug}`
  };
  if (item.price != null) productSchema.offers = {
    '@type': 'Offer',
    priceCurrency: item.currency || 'HUF',
    price: item.price,
    availability: item.purchasable === false ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
    url: `${siteUrl}/products/${item.slug}`
  };
  const schemas = [productSchema, ...(faq.length ? [{
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map(([question, answer]) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: answer
      }
    }))
  }] : []), {
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
      name: item.categoryName,
      item: `${siteUrl}/categories/${item.category}`
    }, {
      '@type': 'ListItem',
      position: 3,
      name: item.name,
      item: `${siteUrl}/products/${item.slug}`
    }]
  }];
  return <GdsStack component="main" gap="md" padding="md">
    {schemas.map((schema, index) => <script key={index} type="application/ld+json" dangerouslySetInnerHTML={{
      __html: JSON.stringify(schema).replace(/</g, '\\u003c')
    }} />)}
    <GdsInline component="header" gap="md" padding="md"><Anchor href="/" aria-label={settings.uiCopy.accessibility?.home}><BrandLogo /></Anchor><GdsInline component="nav" gap="md"><Anchor href="/#shop">{copy.navShop}</Anchor><Anchor href="/#story">{copy.navStory}</Anchor></GdsInline><Anchor href="/#shop">{copy.back}</Anchor></GdsInline>
    <GdsStack gap="md"><Anchor href="/">{copy.home}</Anchor><span>/</span><Anchor href={`/categories/${item.category}`}>{item.categoryName}</Anchor><span>/</span><span>{item.name}</span></GdsStack>
    <SimpleGrid component="section" spacing="md" cols={{
      base: 1,
      md: 2
    }} p="md"><GdsStack gap="md"><ProductVisual product={item} large /></GdsStack><GdsStack gap="md"><span>{item.badge}</span><BodyText>{item.categoryName}</BodyText><PageTitle>{item.name}</PageTitle><BodyText>{item.details.summary}</BodyText><GdsStack gap="md"><strong>{formatPrice(item.price)}</strong>{item.price == null || item.purchasable === false ? <Button disabled type="button">{copy.unavailable}</Button> : <AddToCartButton productId={item.id} label={copy.addToCart} addedLabel={copy.addedToCart} />}</GdsStack>{item.details.info && <BodyText>{item.details.info}</BodyText>}</GdsStack></SimpleGrid>
    <GdsStack component="section" gap="md" padding="md">
      <GdsStack gap="md"><span>{copy.introEyebrow}</span><SectionTitle order={2}>{copy.introTitle}</SectionTitle></GdsStack>
      {item.editorialImage && <figure><MediaWithFallback src={item.editorialImage} alt={applyTemplate(copy.editorialAltTemplate, {
          name: item.name
        })} showShimmer={false} />{item.editorialCaption && <figcaption>{item.editorialCaption}</figcaption>}</figure>}
      <SimpleGrid spacing="md" cols={{
        base: 1,
        md: 2
      }}>
        {item.details.what && <GdsStack component="article" gap="md" padding="md"><SectionTitle order={2}>{copy.packageTitle}</SectionTitle><BodyText>{item.details.what}</BodyText></GdsStack>}
        {item.details.background && <GdsStack component="article" gap="md" padding="md"><SectionTitle order={2}>{copy.backgroundTitle}</SectionTitle><BodyText>{item.details.background}</BodyText></GdsStack>}
        {item.details.flavour && <GdsStack component="article" gap="md" padding="md"><SectionTitle order={2}>{copy.flavourTitle}</SectionTitle><BodyText>{item.details.flavour}</BodyText></GdsStack>}
        {item.details.suits && <GdsStack component="article" gap="md" padding="md"><SectionTitle order={2}>{copy.suitsTitle}</SectionTitle><BodyText>{item.details.suits}</BodyText></GdsStack>}
      </SimpleGrid>
      <SimpleGrid spacing="md" cols={{
        base: 1,
        md: 2
      }}>
        {item.details.uses?.length > 0 && <GdsStack component="article" gap="md" padding="md"><span>{copy.usageEyebrow}</span><SectionTitle order={2}>{copy.pairingTitle}</SectionTitle><ul>{item.details.uses.map(use => <li key={use}>{use}</li>)}</ul></GdsStack>}
        {item.details.serving?.length > 0 && <GdsStack component="article" gap="md" padding="md"><span>{copy.servingEyebrow}</span><SectionTitle order={2}>{copy.servingTitle}</SectionTitle><ol>{item.details.serving.map(idea => <li key={idea}>{idea}</li>)}</ol></GdsStack>}
      </SimpleGrid>
      {(item.details.storage || item.details.info) && <GdsStack component="article" gap="md" padding="md"><GdsStack gap="md"><span>{copy.storageEyebrow}</span><SectionTitle order={2}>{copy.storageTitle}</SectionTitle></GdsStack><GdsStack gap="md">{item.details.storage && <BodyText>{item.details.storage}</BodyText>}{item.details.info && <BodyText>{item.details.info}</BodyText>}</GdsStack></GdsStack>}
      {faq.length > 0 && <GdsStack component="section" gap="md" padding="md"><span>{copy.faqEyebrow}</span><SectionTitle order={2}>{applyTemplate(copy.faqTitleTemplate, {
            name: item.name
          })}</SectionTitle><ProductFaq items={faq} /></GdsStack>}
      {related.length > 0 && <GdsStack component="section" gap="md" padding="md"><span>{copy.relatedEyebrow}</span><SectionTitle order={2}>{applyTemplate(copy.relatedTitleTemplate, {
            category: item.categoryName
          })}</SectionTitle><GdsStack gap="md">{related.map(candidate => <Anchor key={candidate.id} href={`/products/${candidate.slug}`}><span>{candidate.subtitle}</span><b>{candidate.name}</b><MetadataText>{copy.relatedLink}</MetadataText></Anchor>)}</GdsStack></GdsStack>}
    </GdsStack>
  </GdsStack>;
}
