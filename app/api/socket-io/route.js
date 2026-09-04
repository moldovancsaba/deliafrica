import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: 'Socket.io',
    status: 'endpoint-ready',
    note: 'The storefront client is Socket.io-ready. Persistent live connections depend on the Vercel runtime websocket upgrade path.'
  });
}
