import { NextResponse } from 'next/server';
import { getSession, isAuthConfigured } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  return NextResponse.json(session ? { authenticated: true, configured: true, user: session.user, permission: session.permission } : { authenticated: false, configured: isAuthConfigured() });
}
