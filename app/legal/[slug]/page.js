import Link from 'next/link';
import { notFound } from 'next/navigation';
import BrandLogo from '@/app/components/BrandLogo';
import StoreFooter from '@/app/components/StoreFooter';
import { getSiteSettings } from '@/lib/site-settings';
import { applyTemplate } from '@/lib/storefront-copy';
import { APP_VERSION } from '@/lib/version';

export const dynamic='force-dynamic';
const allowed=new Set(['gtc','terms','cookies','consumer','privacy']);

export async function generateMetadata({params}){
  const {slug}=await params;
  if(!allowed.has(slug))return {};
  const settings=await getSiteSettings();
  const doc=settings.legal?.documents?.[slug];
  if(!doc)return {};
  return {title:applyTemplate(settings.uiCopy.legalPage.metaTitleTemplate,{title:doc.title,company:settings.legal?.company?.companyName}),description:doc.summary,alternates:{canonical:`/legal/${slug}`}};
}

export default async function LegalDocumentPage({params}){
  const {slug}=await params;
  if(!allowed.has(slug))notFound();
  const settings=await getSiteSettings();
  const doc=settings.legal?.documents?.[slug];
  if(!doc)notFound();
  const company=settings.legal?.company||{};
  const copy=settings.uiCopy;
  return <main className="legal-page">
    <header className="legal-header"><Link href="/" className="brand-link" aria-label={company.companyName}><BrandLogo /></Link><Link className="legal-back" href="/">{copy.productPage.back}</Link></header>
    <section className="legal-hero"><span className="eyebrow">{copy.footer.legalTitle}</span><h1>{doc.title}</h1><p>{doc.summary}</p></section>
    <section className="legal-content"><article className="legal-document"><p>{doc.body}</p></article><aside className="legal-contact-box"><div><b>{company.companyName}</b><br/>{company.contactName}</div><div>{company.address}</div><div><a href={`mailto:${company.email}`}>{company.email}</a><br/><a href={`tel:${String(company.phone||'').replace(/\s+/g,'')}`}>{company.phone}</a></div></aside></section>
    <StoreFooter legal={settings.legal} copy={settings.uiCopy} version={APP_VERSION}/>
  </main>;
}
