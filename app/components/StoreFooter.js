import Link from 'next/link';
import BrandLogo from '@/app/components/BrandLogo';

function SocialIcon({ type }) {
  if (type === 'instagram') return <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" strokeWidth="2"/><circle cx="12" cy="12" r="4.25" fill="none" stroke="currentColor" strokeWidth="2"/><circle cx="17.4" cy="6.6" r="1.2" fill="currentColor"/></svg>;
  if (type === 'x') return <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.451-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z"/></svg>;
  return <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M24 12.073C24 5.446 18.627.073 12 .073S0 5.446 0 12.073c0 5.99 4.388 10.954 10.125 11.855v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953h-1.512c-1.49 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073Z"/></svg>;
}

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
    <div className="store-footer-column store-footer-social">
      <h3>{footer.socialTitle}</h3>
      {company.instagramUrl && <a className="social-link" href={company.instagramUrl} target="_blank" rel="noreferrer" aria-label={`Instagram ${company.instagram}`}><SocialIcon type="instagram"/><span>{company.instagram}</span></a>}
      {company.xUrl && <a className="social-link" href={company.xUrl} target="_blank" rel="noreferrer" aria-label={`X ${company.x}`}><SocialIcon type="x"/><span>{company.x}</span></a>}
      {company.facebookUrl && <a className="social-link" href={company.facebookUrl} target="_blank" rel="noreferrer" aria-label={`Facebook ${company.facebook}`}><SocialIcon type="facebook"/><span>{company.facebook}</span></a>}
    </div>
    <div className="store-footer-bottom">
      <span>© {new Date().getFullYear()} {company.companyName} · {footer.rights}</span>
      <span>v{version}</span>
    </div>
  </footer>;
}
