import { NextResponse } from 'next/server';
import { completeOAuth, getAppUrl } from '@/lib/auth';

export async function GET(request) {
  try {
    const { returnTo } = await completeOAuth(request, `${getAppUrl(request)}/api/oauth/callback`);
    return NextResponse.redirect(new URL(returnTo, getAppUrl(request)));
  } catch {
    return NextResponse.redirect(new URL('/auth/error', getAppUrl(request)));
  }
}
