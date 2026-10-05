import { customerDirectConfig } from '@/lib/customer-direct-store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  const config = customerDirectConfig();
  const { id } = await params;
  if (!config.enabled || !config.origin || !config.host || !/^[A-Za-z0-9_-]{1,160}$/.test(id || '')) return new Response('Not found', { status: 404 });
  const target = new URL(`/api/storefront/media/${encodeURIComponent(id)}`, config.origin);
  target.searchParams.set('shop', String(process.env.CUSTOMER_DIRECT_SHOP_PATH || 'deli_africa'));
  const response = await fetch(target, {
    headers: { 'x-customer-direct-host': config.host, 'x-forwarded-host': config.host },
    cache: 'no-store'
  });
  if (!response.ok || !response.body) return new Response('Not found', { status: response.status || 404 });
  return new Response(response.body, {
    status: 200,
    headers: {
      'content-type': response.headers.get('content-type') || 'application/octet-stream',
      'cache-control': 'public, max-age=300, stale-while-revalidate=3600'
    }
  });
}
