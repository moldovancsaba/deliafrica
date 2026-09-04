import Link from 'next/link';

export default function AuthError() {
  return <main className="auth-state"><span className="eyebrow dark">SSO HIBA</span><h1>A bejelentkezés nem sikerült.</h1><p>A munkamenet lejárhatott, vagy az alkalmazás-hozzáférés nincs még jóváhagyva.</p><Link className="button button-red" href="/api/auth/login">Újrapróbálom</Link><Link href="/">Vissza a webshophoz</Link></main>;
}
