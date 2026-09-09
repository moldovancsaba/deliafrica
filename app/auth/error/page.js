import Link from 'next/link';
import { getSiteSettings } from '@/lib/site-settings';

export default async function AuthError() {
  const settings=await getSiteSettings();
  const copy=settings.uiCopy.authError;
  return <main className="auth-state"><span className="eyebrow dark">{copy.eyebrow}</span><h1>{copy.title}</h1><p>{copy.body}</p><Link className="button button-red" href="/api/auth/login">{copy.retry}</Link><Link href="/">{copy.back}</Link></main>;
}
