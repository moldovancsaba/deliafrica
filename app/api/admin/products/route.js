import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import { ensureSeedProducts } from '@/lib/catalog-store';
import Product from '@/models/Product';

export const dynamic = 'force-dynamic';

async function admin() {
  const session = await getSession();
  return session && session.permission.status === 'approved' && session.permission.role === 'admin' ? session : null;
}

function clean(body, existing = {}) {
  const number = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
  const arr = (value) => Array.isArray(value) ? value.map((item) => String(item).trim()).filter(Boolean).slice(0, 30) : [];
  return {
    id: String(body.id ?? existing.id ?? '').trim(),
    slug: String(body.slug ?? existing.slug ?? '').trim(),
    sku: String(body.sku ?? existing.sku ?? '').trim(),
    barcode: String(body.barcode ?? existing.barcode ?? '').trim(),
    name: String(body.name ?? existing.name ?? '').trim(),
    subtitle: String(body.subtitle ?? existing.subtitle ?? '').trim(),
    category: String(body.category ?? existing.category ?? '').trim(),
    categoryName: String(body.categoryName ?? existing.categoryName ?? '').trim(),
    badge: String(body.badge ?? existing.badge ?? '').trim(),
    tone: String(body.tone ?? existing.tone ?? 'red').trim(),
    visual: String(body.visual ?? existing.visual ?? '').trim(),
    image: String(body.image ?? existing.image ?? '').trim(),
    editorialImage: String(body.editorialImage ?? existing.editorialImage ?? '').trim(),
    price: body.price === '' || body.price == null ? null : number(body.price, null),
    currency: String(body.currency ?? existing.currency ?? 'HUF').trim(),
    vatRate: number(body.vatRate, existing.vatRate ?? 27),
    active: body.active !== undefined ? Boolean(body.active) : existing.active !== false,
    purchasable: body.purchasable !== undefined ? Boolean(body.purchasable) : existing.purchasable !== false,
    story: String(body.story ?? existing.story ?? '').slice(0, 5000),
    whatItIs: String(body.whatItIs ?? existing.whatItIs ?? '').slice(0, 5000),
    flavour: String(body.flavour ?? existing.flavour ?? '').slice(0, 5000),
    audience: String(body.audience ?? existing.audience ?? '').slice(0, 5000),
    packaging: String(body.packaging ?? existing.packaging ?? '').slice(0, 5000),
    originCountry: String(body.originCountry ?? existing.originCountry ?? 'South Africa').trim(),
    brand: String(body.brand ?? existing.brand ?? '').trim(),
    ingredients: String(body.ingredients ?? existing.ingredients ?? '').slice(0, 10000),
    allergens: String(body.allergens ?? existing.allergens ?? '').slice(0, 5000),
    storage: String(body.storage ?? existing.storage ?? '').slice(0, 5000),
    nutrition: String(body.nutrition ?? existing.nutrition ?? '').slice(0, 10000),
    pairings: arr(body.pairings ?? existing.pairings),
    servingIdeas: arr(body.servingIdeas ?? existing.servingIdeas),
    dimensions: {
      widthMm: number(body.dimensions?.widthMm, existing.dimensions?.widthMm || 0),
      heightMm: number(body.dimensions?.heightMm, existing.dimensions?.heightMm || 0),
      depthMm: number(body.dimensions?.depthMm, existing.dimensions?.depthMm || 0),
      weightG: number(body.dimensions?.weightG, existing.dimensions?.weightG || 0)
    },
    parcel: {
      widthMm: number(body.parcel?.widthMm, existing.parcel?.widthMm || 0),
      heightMm: number(body.parcel?.heightMm, existing.parcel?.heightMm || 0),
      depthMm: number(body.parcel?.depthMm, existing.parcel?.depthMm || 0),
      weightG: number(body.parcel?.weightG, existing.parcel?.weightG || 0),
      unitsPerParcel: Math.max(1, number(body.parcel?.unitsPerParcel, existing.parcel?.unitsPerParcel || 1))
    },
    inventory: {
      stockQty: Math.max(0, number(body.inventory?.stockQty, existing.inventory?.stockQty || 0)),
      reservedQty: Math.max(0, number(body.inventory?.reservedQty, existing.inventory?.reservedQty || 0)),
      lowStockThreshold: Math.max(0, number(body.inventory?.lowStockThreshold, existing.inventory?.lowStockThreshold || 3)),
      trackInventory: body.inventory?.trackInventory !== undefined ? Boolean(body.inventory.trackInventory) : existing.inventory?.trackInventory !== false
    }
  };
}

export async function GET() {
  const session = await admin();
  if (!session) return NextResponse.json({ error: 'Admin role required' }, { status: 403 });
  const db = await connectToDatabase();
  if (!db.connected) return NextResponse.json({ error: 'MongoDB unavailable' }, { status: 503 });
  await ensureSeedProducts();
  const products = await Product.find({}).sort({ createdAt: 1 }).lean();
  return NextResponse.json({ products }, { headers: { 'cache-control': 'no-store' } });
}

export async function POST(request) {
  const session = await admin();
  if (!session) return NextResponse.json({ error: 'Admin role required' }, { status: 403 });
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  const db = await connectToDatabase();
  if (!db.connected) return NextResponse.json({ error: 'MongoDB unavailable' }, { status: 503 });
  const data = clean(body);
  if (!data.id || !data.slug || !data.name || !data.category) return NextResponse.json({ error: 'id, slug, name and category are required' }, { status: 400 });
  data.updatedBy = session.user.email;
  try { const product = await Product.create(data); return NextResponse.json({ ok: true, product }, { status: 201 }); }
  catch (error) { return NextResponse.json({ error: error?.code === 11000 ? 'Duplicate id, slug, SKU or barcode' : 'Unable to create product' }, { status: 400 }); }
}

export async function PUT(request) {
  const session = await admin();
  if (!session) return NextResponse.json({ error: 'Admin role required' }, { status: 403 });
  const body = await request.json().catch(() => null);
  if (!body?.id) return NextResponse.json({ error: 'Product id required' }, { status: 400 });
  const db = await connectToDatabase();
  if (!db.connected) return NextResponse.json({ error: 'MongoDB unavailable' }, { status: 503 });
  const existing = await Product.findOne({ id: body.id }).lean();
  if (!existing) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  const data = clean(body, existing);
  data.updatedBy = session.user.email;
  try {
    const product = await Product.findOneAndUpdate({ id: body.id }, data, { new: true, runValidators: true });
    return NextResponse.json({ ok: true, product });
  } catch (error) {
    return NextResponse.json({ error: error?.code === 11000 ? 'Duplicate slug, SKU or barcode' : 'Unable to update product' }, { status: 400 });
  }
}

export async function DELETE(request) {
  const session = await admin();
  if (!session) return NextResponse.json({ error: 'Admin role required' }, { status: 403 });
  const body = await request.json().catch(() => null);
  if (!body?.id) return NextResponse.json({ error: 'Product id required' }, { status: 400 });
  const db = await connectToDatabase();
  if (!db.connected) return NextResponse.json({ error: 'MongoDB unavailable' }, { status: 503 });
  const result = await Product.deleteOne({ id: body.id });
  return result.deletedCount ? NextResponse.json({ ok: true }) : NextResponse.json({ error: 'Product not found' }, { status: 404 });
}
