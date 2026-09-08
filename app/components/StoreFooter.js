import Link from 'next/link';
import BrandLogo from '@/app/components/BrandLogo';

export default function StoreFooter({ legal, copy, version }) {
  const company = legal?.company || {};
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
      <Link href="/legal/gtc">GTC / ÁSZF</Link>
      <Link href="/legal/terms">T&amp;C</Link>
      <Link href="/legal/cookies">Cookies</Link>
      <Link href="/legal/consumer">Fogyasztóvédelem</Link>
      <Link href="/legal/privacy">GDPR / Adatkezelés</Link>
    </div>
    <div className="store-footer-column">
      <h3>{footer.socialTitle}</h3>
      {company.instagramUrl && <a href={company.instagramUrl} target="_blank" rel="noreferrer">Instagram · {company.instagram}</a>}
      {company.xUrl && <a href={company.xUrl} target="_blank" rel="noreferrer">X · {company.x}</a>}
      {company.facebookUrl && <a href={company.facebookUrl} target="_blank" rel="noreferrer">Facebook · {company.facebook}</a>}
    </div>
    <div className="store-footer-bottom">
      <span>© {new Date().getFullYear()} {company.companyName} · {footer.rights}</span>
      <span>v{version}</span>
    </div>
  </footer>;
}
