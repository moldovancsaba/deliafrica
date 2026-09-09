import { redirect } from 'next/navigation';
import { getSession, isAuthConfigured } from '@/lib/auth';
import { getSiteSettings } from '@/lib/site-settings';
import ProfileClient from './ProfileClient';
export const dynamic = 'force-dynamic';
export async function generateMetadata() {
  const settings = await getSiteSettings();
  return {
    title: settings.uiCopy.profile.metaTitle,
    description: settings.uiCopy.profile.metaDescription
  };
}
export default async function ProfilePage() {
  if (!isAuthConfigured()) redirect('/');
  const session = await getSession();
  if (!session) redirect('/api/auth/login?returnTo=/profile');
  return <ProfileClient />;
}
