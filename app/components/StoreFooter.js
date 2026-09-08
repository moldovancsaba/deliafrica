import Link from 'next/link';
import BrandLogo from '@/app/components/BrandLogo';

export default function StoreFooter({ legal, copy, version }) {
  const company = legal?.company || {};
  const docs = legal?.documents || {};
  const footer = copy?.footer || {};
  return <footer className="store-footer">
    <div className="store-footer-brand">
      <BrandLogo inverse />
      <p><strong>{company.companyName}</strong><br />{company.contactName}<br />{company.address}</p>
    </div>
    <div className="store-footer-column">
      <h3>{footer.contactTitle}</h3>
      {company.phone && <a href={`tel:${company.phone.replace(/\s+/g,'')}`}>{company.phone}</a>}
      {company.email && <a href={`mailto:${company.email}`}>{company.email}</a>}
    </div>
    <div className="store-footer-column">
      <h3>{footer.legalTitle}</h3>
      <Link href="/legal/gtc">{docs.gtc?.title}</Link>
      <Link href="/legal/terms">{docs.terms?.title}</Link>
      <Link href="/legal/cookies">{docs.cookies?.title}</Link>
      <Link href="/legal/consumer">{docs.consumer?.title}</Link>
      <Link href="/legal/privacy">{docs.privacy?.title}</Link>
    </div>
    <div className="store-footer-column">
      <h3>{footer.socialTitle}</h3>
      {company.instagramUrl && <a href={company.instagramUrl} target="_blank" rel="noreferrer">{company.instagram}</a>}
      {company.xUrl && <a href={company.xUrl} target="_blank" rel="noreferrer">{company.x}</a>}
      {company.facebookUrl && <a href={company.facebookUrl} target="_blank" rel="noreferrer">{company.facebook}</a>}
    </div>
    <div className="store-footer-bottom">
      <span>© {new Date().getFullYear()} {company.companyName} · {footer.rights}</span>
      <span>v{version}</span>
    </div>
  </footer>;
}
