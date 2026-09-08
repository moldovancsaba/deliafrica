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
  const arr = (value) => Array.isArray(value) ? value.map((item) => String(item).trim()).filter(Boolean).slice(0, 50) : [];
  const faq = (value) => Array.isArray(value) ? value.slice(0, 30).map((item) => ({ question: String(item?.question || '').trim().slice(0, 500), answer: String(item?.answer || '').trim().slice(0, 5000) })).filter((item) => item.question && item.answer) : [];
  const text = (value, fallback = '', max = 5000) => String(value ?? fallback ?? '').slice(0, max);
  return {
    id: text(body.id, existing.id, 200).trim(), slug: text(body.slug, existing.slug, 300).trim(), sku: text(body.sku, existing.sku, 200).trim(), barcode: text(body.barcode, existing.barcode, 200).trim(),
    name: text(body.name, existing.name, 500).trim(), subtitle: text(body.subtitle, existing.subtitle, 1000).trim(), category: text(body.category, existing.category, 200).trim(), categoryName: text(body.categoryName, existing.categoryName, 500).trim(),
    badge: text(body.badge, existing.badge, 200).trim(), tone: text(body.tone, existing.tone || 'red', 100).trim(), visual: text(body.visual, existing.visual, 100).trim(), image: text(body.image, existing.image, 1000).trim(), heroImage: text(body.heroImage, existing.heroImage, 1000).trim(), editorialImage: text(body.editorialImage, existing.editorialImage, 1000).trim(), editorialCaption: text(body.editorialCaption, existing.editorialCaption, 3000),
    price: body.price === '' || body.price == null ? null : number(body.price, null), currency: text(body.currency, existing.currency || 'HUF', 20).trim(), vatRate: number(body.vatRate, existing.vatRate ?? 27),
    active: body.active !== undefined ? Boolean(body.active) : existing.active !== false, purchasable: body.purchasable !== undefined ? Boolean(body.purchasable) : existing.purchasable !== false,
    story: text(body.story, existing.story), whatItIs: text(body.whatItIs, existing.whatItIs), background: text(body.background, existing.background), flavour: text(body.flavour, existing.flavour), audience: text(body.audience, existing.audience), packaging: text(body.packaging, existing.packaging), info: text(body.info, existing.info),
    originCountry: text(body.originCountry, existing.originCountry || 'South Africa', 300).trim(), brand: text(body.brand, existing.brand, 300).trim(), ingredients: text(body.ingredients, existing.ingredients, 10000), allergens: text(body.allergens, existing.allergens), storage: text(body.storage, existing.storage), nutrition: text(body.nutrition, existing.nutrition, 10000),
    pairings: arr(body.pairings ?? existing.pairings), servingIdeas: arr(body.servingIdeas ?? existing.servingIdeas), faq: faq(body.faq ?? existing.faq),
    seo: {
      title: text(body.seo?.title, existing.seo?.title, 500).trim(), description: text(body.seo?.description, existing.seo?.description, 1000).trim(), aiSummary: text(body.seo?.aiSummary, existing.seo?.aiSummary, 3000).trim(),
      ogTitle: text(body.seo?.ogTitle, existing.seo?.ogTitle, 500).trim(), ogDescription: text(body.seo?.ogDescription, existing.seo?.ogDescription, 1000).trim()
    },
    dimensions: { widthMm: number(body.dimensions?.widthMm, existing.dimensions?.widthMm || 0), heightMm: number(body.dimensions?.heightMm, existing.dimensions?.heightMm || 0), depthMm: number(body.dimensions?.depthMm, existing.dimensions?.depthMm || 0), weightG: number(body.dimensions?.weightG, existing.dimensions?.weightG || 0) },
    parcel: { widthMm: number(body.parcel?.widthMm, existing.parcel?.widthMm || 0), heightMm: number(body.parcel?.heightMm, existing.parcel?.heightMm || 0), depthMm: number(body.parcel?.depthMm, existing.parcel?.depthMm || 0), weightG: number(body.parcel?.weightG, existing.parcel?.weightG || 0), unitsPerParcel: Math.max(1, number(body.parcel?.unitsPerParcel, existing.parcel?.unitsPerParcel || 1)) },
    inventory: { stockQty: Math.max(0, number(body.inventory?.stockQty, existing.inventory?.stockQty || 0)), reservedQty: Math.max(0, number(body.inventory?.reservedQty, existing.inventory?.reservedQty || 0)), lowStockThreshold: Math.max(0, number(body.inventory?.lowStockThreshold, existing.inventory?.lowStockThreshold || 3)), trackInventory: body.inventory?.trackInventory !== undefined ? Boolean(body.inventory.trackInventory) : existing.inventory?.trackInventory !== false }
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
  const session = await admin(); if (!session) return NextResponse.json({ error: 'Admin role required' }, { status: 403 });
  const body = await request.json().catch(() => null); if (!body) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  const db = await connectToDatabase(); if (!db.connected) return NextResponse.json({ error: 'MongoDB unavailable' }, { status: 503 });
  const data = clean(body); if (!data.id || !data.slug || !data.name || !data.category) return NextResponse.json({ error: 'id, slug, name and category are required' }, { status: 400 });
  data.updatedBy = session.user.email;
  try { const product = await Product.create(data); return NextResponse.json({ ok: true, product }, { status: 201 }); }
  catch (error) { return NextResponse.json({ error: error?.code === 11000 ? 'Duplicate id, slug, SKU or barcode' : 'Unable to create product' }, { status: 400 }); }
}

export async function PUT(request) {
  const session = await admin(); if (!session) return NextResponse.json({ error: 'Admin role required' }, { status: 403 });
  const body = await request.json().catch(() => null); if (!body?.id) return NextResponse.json({ error: 'Product id required' }, { status: 400 });
  const db = await connectToDatabase(); if (!db.connected) return NextResponse.json({ error: 'MongoDB unavailable' }, { status: 503 });
  const existing = await Product.findOne({ id: body.id }).lean(); if (!existing) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  const data = clean(body, existing); data.updatedBy = session.user.email;
  try { const product = await Product.findOneAndUpdate({ id: body.id }, data, { new: true, runValidators: true }); return NextResponse.json({ ok: true, product }); }
  catch (error) { return NextResponse.json({ error: error?.code === 11000 ? 'Duplicate slug, SKU or barcode' : 'Unable to update product' }, { status: 400 }); }
}

export async function DELETE(request) {
  const session = await admin(); if (!session) return NextResponse.json({ error: 'Admin role required' }, { status: 403 });
  const body = await request.json().catch(() => null); if (!body?.id) return NextResponse.json({ error: 'Product id required' }, { status: 400 });
  const db = await connectToDatabase(); if (!db.connected) return NextResponse.json({ error: 'MongoDB unavailable' }, { status: 503 });
  const result = await Product.deleteOne({ id: body.id });
  return result.deletedCount ? NextResponse.json({ ok: true }) : NextResponse.json({ error: 'Product not found' }, { status: 404 });
}
