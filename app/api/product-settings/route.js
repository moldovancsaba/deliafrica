import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import { products } from '@/lib/products';
import ProductSetting from '@/models/ProductSetting';

export const dynamic = 'force-dynamic';

export async function GET() {
  const mongo = await connectToDatabase();
  if (!mongo.connected) return NextResponse.json({ products: products.map(({ id, name, packageDimensionsMm }) => ({ id, name, ...packageDimensionsMm })), persisted: false });
  const saved = await ProductSetting.find({}).lean();
  const byId = new Map(saved.map((item) => [item.productId, item]));
  return NextResponse.json({ products: products.map(({ id, name, packageDimensionsMm }) => {
    const item = byId.get(id);
    return { id, name, width: item?.widthMm ?? packageDimensionsMm.width, height: item?.heightMm ?? packageDimensionsMm.height };
  }), persisted: true }, { headers: { 'cache-control': 'no-store' } });
}

export async function PUT(request) {
  const session = await getSession();
  if (!session || session.permission.status !== 'approved' || session.permission.role !== 'admin') return NextResponse.json({ error: 'Admin role required' }, { status: 403 });
  const body = await request.json();
  const product = products.find((item) => item.id === body.productId);
  const widthMm = Number(body.width);
  const heightMm = Number(body.height);
  if (!product || !Number.isFinite(widthMm) || !Number.isFinite(heightMm) || widthMm < 1 || heightMm < 1 || widthMm > 2000 || heightMm > 2000) return NextResponse.json({ error: 'Invalid product dimensions' }, { status: 400 });
  const mongo = await connectToDatabase();
  if (!mongo.connected) return NextResponse.json({ error: 'MongoDB unavailable' }, { status: 503 });
  await ProductSetting.findOneAndUpdate({ productId: product.id }, { widthMm, heightMm, updatedBy: session.user.email }, { upsert: true, runValidators: true });
  return NextResponse.json({ ok: true, productId: product.id, width: widthMm, height: heightMm });
}
