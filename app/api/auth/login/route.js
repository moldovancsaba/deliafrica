import { NextResponse } from 'next/server';
import { authorizationUrl, createOAuthFlow, getAppUrl, saveOAuthFlow } from '@/lib/auth';

export async function GET(request) {
  try {
    const returnTo = new URL(request.url).searchParams.get('returnTo') || '/';
    const flow = createOAuthFlow(returnTo);
    const redirectUri = `${getAppUrl(request)}/auth/callback`;
    await saveOAuthFlow(flow);
    return NextResponse.redirect(authorizationUrl(flow, redirectUri));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'SSO login is unavailable' }, { status: 503 });
  }
}
