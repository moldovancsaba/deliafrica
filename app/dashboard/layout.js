import { AppShell } from "@/app/components/gds";
import { Anchor, GdsInline, GdsStack, PageTitle } from "@/app/components/gds";
import { GdsContainer, GdsSidebar } from "@/app/components/gds";
import { redirect } from 'next/navigation';
import { getSession, isAuthConfigured } from '@/lib/auth';
import BrandLogo from '@/app/components/BrandLogo';
export const dynamic = 'force-dynamic';
const nav = [['/dashboard', 'Áttekintés'], ['/dashboard/users', 'Felhasználók'], ['/dashboard/products', 'Termékek'], ['/dashboard/orders', 'Rendelések'], ['/dashboard/integrations', 'Integrációk'], ['/dashboard/content', 'Tartalom'], ['/dashboard/legal', 'Jogi és cégadatok'], ['/dashboard/storefront', 'Megjelenés'], ['/dashboard/system', 'Rendszer']];
export default async function DashboardLayout({
  children
}) {
  if (!isAuthConfigured()) return <GdsStack component="main" gap="md" padding="md"><PageTitle>Admin belépés nincs konfigurálva.</PageTitle><Anchor href="/">Vissza a webshophoz</Anchor></GdsStack>;
  const session = await getSession();
  if (!session) redirect('/api/auth/login?returnTo=/dashboard');
  if (session.permission.status !== 'approved' || session.permission.role !== 'admin') redirect('/');
  return <AppShell logoText="deli.africa" showThemeToggle={false}
    primaryNavigation={<GdsStack component="nav" gap="sm" aria-label="Admin navigáció">{nav.map(([href,label])=><Anchor key={href} href={href}>{label}</Anchor>)}</GdsStack>}
    headerActions={<Anchor href="/">Webshop</Anchor>}
    accountPanel={<GdsStack gap="sm"><span>{session.user.name}</span><span>{session.user.email}</span><Anchor href="/api/auth/logout">Kijelentkezés</Anchor></GdsStack>}>
    <GdsStack gap="lg">{children}</GdsStack>
  </AppShell>;
}
