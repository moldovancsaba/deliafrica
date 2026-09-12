import 'server-only';
import { connectToDatabase } from '@/lib/db';
import { products as staticProducts } from '@/lib/products';
import { getCustomerDirectCatalog } from '@/lib/customer-direct-store';
import Product from '@/models/Product';

const CONTENT_SEED_VERSION = 1;

function fromStatic(product) {
  const details = product.details || {};
  return {
    id: product.id, slug: product.slug, sku: product.sku || '', barcode: product.barcode || '', name: product.name,
    subtitle: product.subtitle || '', category: product.category, categoryName: product.categoryName || '', badge: product.badge || '', tone: product.tone || 'red', visual: product.visual || '',
    image: product.image || '', heroImage: product.heroImage || '', editorialImage: product.editorialImage || '', editorialCaption: product.editorialCaption || '',
    price: product.price, currency: 'HUF', vatRate: 27, active: true, purchasable: product.price != null,
    story: product.story || details.summary || '', whatItIs: product.whatItIs || details.what || '', background: product.background || details.background || '', flavour: product.flavour || details.flavour || '',
    audience: product.audience || details.suits || '', packaging: product.packaging || details.info || '', info: product.info || details.info || '', originCountry: 'South Africa', brand: product.brand || '',
    ingredients: '', allergens: '', storage: details.storage || '', nutrition: '', pairings: product.pairings || details.uses || [], servingIdeas: product.servingIdeas || details.serving || [],
    faq: (details.faq || []).map(([question, answer]) => ({ question, answer })),
    seo: { title: '', description: product.story || details.summary || '', aiSummary: product.story || details.summary || '', ogTitle: '', ogDescription: '' },
    dimensions: { widthMm: product.packageDimensionsMm?.width || 0, heightMm: product.packageDimensionsMm?.height || 0, depthMm: product.packageDimensionsMm?.depth || 0, weightG: product.packageDimensionsMm?.weightG || 0 },
    parcel: { widthMm: 0, heightMm: 0, depthMm: 0, weightG: 0, unitsPerParcel: 1 }, inventory: { stockQty: 0, reservedQty: 0, lowStockThreshold: 3, trackInventory: true },
    contentSeedVersion: CONTENT_SEED_VERSION
  };
}

function blank(value) {
  if (value == null) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

const migrationFilter = { $or: [ { contentSeedVersion: { $lt: CONTENT_SEED_VERSION } }, { contentSeedVersion: { $exists: false } } ] };

export async function ensureSeedProducts() {
  const db = await connectToDatabase();
  if (!db.connected) return false;
  const count = await Product.countDocuments();
  if (count === 0) {
    if (staticProducts.length) await Product.insertMany(staticProducts.map(fromStatic), { ordered: false }).catch(() => {});
    return true;
  }

  const seedById = new Map(staticProducts.map(item => [item.id, fromStatic(item)]));
  const existing = await Product.find({ id: { $in: [...seedById.keys()] }, ...migrationFilter }).lean();
  const ops = [];
  for (const row of existing) {
    const seed = seedById.get(row.id);
    if (!seed) continue;
    const set = { contentSeedVersion: CONTENT_SEED_VERSION };
    for (const key of ['story','whatItIs','background','flavour','audience','packaging','info','storage','heroImage','editorialCaption']) {
      if (blank(row[key]) && !blank(seed[key])) set[key] = seed[key];
    }
    if (blank(row.pairings) && seed.pairings.length) set.pairings = seed.pairings;
    if (blank(row.servingIdeas) && seed.servingIdeas.length) set.servingIdeas = seed.servingIdeas;
    if (blank(row.faq) && seed.faq.length) set.faq = seed.faq;
    const seo = { ...(row.seo || {}) };
    let seoChanged = false;
    for (const key of ['title','description','aiSummary','ogTitle','ogDescription']) {
      if (blank(seo[key]) && !blank(seed.seo[key])) { seo[key] = seed.seo[key]; seoChanged = true; }
    }
    if (seoChanged) set.seo = seo;
    ops.push({ updateOne: { filter: { id: row.id, ...migrationFilter }, update: { $set: set } } });
  }
  if (ops.length) await Product.bulkWrite(ops, { ordered: false });
  return true;
}

export async function getCatalog({ includeInactive = false } = {}) {
  const managed = await getCustomerDirectCatalog();
  if (managed) return includeInactive ? managed.products : managed.products.filter(product => product.active !== false);
  const db = await connectToDatabase();
  if (!db.connected) return staticProducts;
  await ensureSeedProducts();
  const query = includeInactive ? {} : { active: true };
  const rows = await Product.find(query).sort({ createdAt: 1 }).lean();
  return rows.map(row => ({ ...row, packageDimensionsMm: { width: row.dimensions?.widthMm || 0, height: row.dimensions?.heightMm || 0, depth: row.dimensions?.depthMm || 0, weightG: row.dimensions?.weightG || 0 } }));
}

export async function getProductBySlug(slug) {
  const managed = await getCustomerDirectCatalog();
  if (managed) return managed.products.find(item => item.slug === slug && item.active !== false) || null;
  const db = await connectToDatabase();
  if (!db.connected) return staticProducts.find(item => item.slug === slug) || null;
  await ensureSeedProducts();
  const row = await Product.findOne({ slug, active: true }).lean();
  return row ? { ...row, packageDimensionsMm: { width: row.dimensions?.widthMm || 0, height: row.dimensions?.heightMm || 0, depth: row.dimensions?.depthMm || 0, weightG: row.dimensions?.weightG || 0 } } : null;
}
