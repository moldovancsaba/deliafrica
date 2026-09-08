import 'server-only';
import { connectToDatabase } from '@/lib/db';
import { products as staticProducts } from '@/lib/products';
import Product from '@/models/Product';

function fromStatic(product) {
  return {
    id: product.id,
    slug: product.slug,
    sku: product.sku || '',
    barcode: product.barcode || '',
    name: product.name,
    subtitle: product.subtitle || '',
    category: product.category,
    categoryName: product.categoryName || '',
    badge: product.badge || '',
    tone: product.tone || 'red',
    visual: product.visual || '',
    image: product.image || '',
    editorialImage: product.editorialImage || '',
    price: product.price,
    currency: 'HUF',
    vatRate: 27,
    active: true,
    purchasable: product.price != null,
    story: product.story || '',
    whatItIs: product.whatItIs || '',
    flavour: product.flavour || '',
    audience: product.audience || '',
    packaging: product.packaging || '',
    originCountry: 'South Africa',
    brand: product.brand || '',
    ingredients: '', allergens: '', storage: '', nutrition: '',
    pairings: product.pairings || [],
    servingIdeas: product.servingIdeas || [],
    dimensions: {
      widthMm: product.packageDimensionsMm?.width || 0,
      heightMm: product.packageDimensionsMm?.height || 0,
      depthMm: product.packageDimensionsMm?.depth || 0,
      weightG: product.packageDimensionsMm?.weightG || 0
    },
    parcel: { widthMm: 0, heightMm: 0, depthMm: 0, weightG: 0, unitsPerParcel: 1 },
    inventory: { stockQty: 0, reservedQty: 0, lowStockThreshold: 3, trackInventory: true }
  };
}

export async function ensureSeedProducts() {
  const db = await connectToDatabase();
  if (!db.connected) return false;
  const count = await Product.countDocuments();
  if (count > 0) return true;
  if (staticProducts.length) await Product.insertMany(staticProducts.map(fromStatic), { ordered: false }).catch(() => {});
  return true;
}

export async function getCatalog({ includeInactive = false } = {}) {
  const db = await connectToDatabase();
  if (!db.connected) return staticProducts;
  await ensureSeedProducts();
  const query = includeInactive ? {} : { active: true };
  const rows = await Product.find(query).sort({ createdAt: 1 }).lean();
  return rows.map((row) => ({
    ...row,
    packageDimensionsMm: { width: row.dimensions?.widthMm || 0, height: row.dimensions?.heightMm || 0, depth: row.dimensions?.depthMm || 0, weightG: row.dimensions?.weightG || 0 }
  }));
}

export async function getProductBySlug(slug) {
  const db = await connectToDatabase();
  if (!db.connected) return staticProducts.find((item) => item.slug === slug) || null;
  await ensureSeedProducts();
  const row = await Product.findOne({ slug }).lean();
  return row ? { ...row, packageDimensionsMm: { width: row.dimensions?.widthMm || 0, height: row.dimensions?.heightMm || 0, depth: row.dimensions?.depthMm || 0, weightG: row.dimensions?.weightG || 0 } } : null;
}
