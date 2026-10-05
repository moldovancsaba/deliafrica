import { NextResponse } from 'next/server';
import { getCatalogData } from '@/lib/catalog-store';

export const dynamic = 'force-dynamic';

export async function GET() {
  const catalog = await getCatalogData();
  return NextResponse.json(catalog, { headers: { 'cache-control': 'no-store, max-age=0' } });
}
