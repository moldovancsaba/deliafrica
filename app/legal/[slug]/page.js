import { Anchor, BodyText, GdsInline, GdsStack, PageTitle, SimpleGrid } from "@/app/components/gds";
import Link from 'next/link';
import { notFound } from 'next/navigation';
import BrandLogo from '@/app/components/BrandLogo';
import StoreFooter from '@/app/components/StoreFooter';
import { getSiteSettings } from '@/lib/site-settings';
import { applyTemplate } from '@/lib/storefront-copy';
import { APP_VERSION } from '@/lib/version';
export const dynamic = 'force-dynamic';
const allowed = new Set(['gtc', 'terms', 'cookies', 'consumer', 'privacy']);
export async function generateMetadata({
  params
}) {
  const {
    slug
  } = await params;
  if (!allowed.has(slug)) return {};
  const settings = await getSiteSettings();
  const doc = settings.legal?.documents?.[slug];
  if (!doc) return {};
  return {
    title: applyTemplate(settings.uiCopy.legalPage.metaTitleTemplate, {
      title: doc.title,
      company: settings.legal?.company?.companyName
    }),
    description: doc.summary,
    alternates: {
      canonical: `/legal/${slug}`
    }
  };
}
export default async function LegalDocumentPage({
  params
}) {
  const {
    slug
  } = await params;
  if (!allowed.has(slug)) notFound();
  const settings = await getSiteSettings();
  const doc = settings.legal?.documents?.[slug];
  if (!doc) notFound();
  const company = settings.legal?.company || {};
  const copy = settings.uiCopy;
  return <GdsStack component="main" gap="md" padding="md">
    <GdsInline component="header" gap="md" padding="md"><Anchor href="/" aria-label={company.companyName}><BrandLogo /></Anchor><Anchor href="/">{copy.productPage.back}</Anchor></GdsInline>
    <SimpleGrid component="section" spacing="md" cols={{
      base: 1,
      md: 2
    }} p="md"><span>{copy.footer.legalTitle}</span><PageTitle>{doc.title}</PageTitle><BodyText>{doc.summary}</BodyText></SimpleGrid>
    <GdsStack component="section" gap="md" padding="md"><GdsStack component="article" gap="md" padding="md"><BodyText>{doc.body}</BodyText></GdsStack><GdsStack component="aside" gap="md" padding="md"><GdsStack gap="md"><b>{company.companyName}</b><br />{company.contactName}</GdsStack><GdsStack gap="md">{company.address}</GdsStack><GdsStack gap="md"><Anchor href={`mailto:${company.email}`}>{company.email}</Anchor><br /><Anchor href={`tel:${String(company.phone || '').replace(/\s+/g, '')}`}>{company.phone}</Anchor></GdsStack></GdsStack></GdsStack>
    <StoreFooter legal={settings.legal} copy={settings.uiCopy} version={APP_VERSION} />
  </GdsStack>;
}
