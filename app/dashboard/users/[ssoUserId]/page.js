import UserHistoryClient from './UserHistoryClient';

export const dynamic = 'force-dynamic';

export default async function UserHistoryPage({ params }) {
  const { ssoUserId } = await params;
  return <UserHistoryClient ssoUserId={decodeURIComponent(ssoUserId)} />;
}
