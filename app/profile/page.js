import { redirect } from 'next/navigation';
import { getSession, isAuthConfigured } from '@/lib/auth';
import ProfileClient from './ProfileClient';
import './profile.css';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Profil | deli.africa',
  description: 'Mentett szállítási és számlázási adatok, valamint rendelési előzmények.'
};

export default async function ProfilePage() {
  if (!isAuthConfigured()) redirect('/');
  const session = await getSession();
  if (!session) redirect('/api/auth/login?returnTo=/profile');
  return <ProfileClient />;
}
