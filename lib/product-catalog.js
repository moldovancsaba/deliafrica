import 'server-only';
import { unstable_noStore as noStore } from 'next/cache';
import { connectToDatabase } from '@/lib/db';
import { products } from '@/lib/products';
import ProductSetting from '@/models/ProductSetting';

export async function getProductsWithSettings() {
  noStore();
  const mongo = await connectToDatabase();
  if (!mongo.connected) return products;
  const settings = await ProductSetting.find({}).lean();
  const byId = new Map(settings.map((item) => [item.productId, item]));
  return products.map((product) => {
    const setting = byId.get(product.id);
    return setting ? { ...product, packageDimensionsMm: { width: setting.widthMm, height: setting.heightMm } } : product;
  });
}
