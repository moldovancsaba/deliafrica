import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const startedAt = Date.now();
  const mongo = await connectToDatabase();

  return NextResponse.json({
    status: 'ok',
    mongo,
    users: {
      active: 0,
      tracking: 'not-enabled',
      state: 'No Active Users'
    },
    realtime: {
      transport: 'Socket.io',
      endpoint: '/api/socket-io',
      status: 'endpoint-ready'
    },
    runtime: process.env.VERCEL ? 'Vercel' : 'Local',
    environment: process.env.VERCEL_ENV || process.env.NODE_ENV || 'development',
    latencyMs: Date.now() - startedAt,
    timestamp: new Date().toISOString()
  });
}
