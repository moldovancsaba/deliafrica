import mongoose from 'mongoose';

const DimensionsSchema = new mongoose.Schema({
  widthMm: { type: Number, min: 0, default: 0 },
  heightMm: { type: Number, min: 0, default: 0 },
  depthMm: { type: Number, min: 0, default: 0 },
  weightG: { type: Number, min: 0, default: 0 }
}, { _id: false });

const InventorySchema = new mongoose.Schema({
  stockQty: { type: Number, min: 0, default: 0 },
  reservedQty: { type: Number, min: 0, default: 0 },
  lowStockThreshold: { type: Number, min: 0, default: 3 },
  trackInventory: { type: Boolean, default: true }
}, { _id: false });

const ParcelSchema = new mongoose.Schema({
  widthMm: { type: Number, min: 0, default: 0 },
  heightMm: { type: Number, min: 0, default: 0 },
  depthMm: { type: Number, min: 0, default: 0 },
  weightG: { type: Number, min: 0, default: 0 },
  unitsPerParcel: { type: Number, min: 1, default: 1 }
}, { _id: false });

const FaqSchema = new mongoose.Schema({
  question: { type: String, default: '' },
  answer: { type: String, default: '' }
}, { _id: false });

const SeoSchema = new mongoose.Schema({
  title: { type: String, default: '' },
  description: { type: String, default: '' },
  aiSummary: { type: String, default: '' },
  ogTitle: { type: String, default: '' },
  ogDescription: { type: String, default: '' }
}, { _id: false });

const ProductSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true, trim: true },
  slug: { type: String, required: true, unique: true, index: true, trim: true },
  sku: { type: String, trim: true, default: '' },
  barcode: { type: String, trim: true, default: '' },
  name: { type: String, required: true, trim: true },
  subtitle: { type: String, default: '' },
  category: { type: String, required: true },
  categoryName: { type: String, default: '' },
  badge: { type: String, default: '' },
  tone: { type: String, default: 'red' },
  visual: { type: String, default: 'box' },
  image: { type: String, default: '' },
  heroImage: { type: String, default: '' },
  editorialImage: { type: String, default: '' },
  editorialCaption: { type: String, default: '' },
  price: { type: Number, min: 0, default: null },
  currency: { type: String, default: 'HUF' },
  vatRate: { type: Number, min: 0, max: 100, default: 27 },
  active: { type: Boolean, default: true },
  purchasable: { type: Boolean, default: true },
  story: { type: String, default: '' },
  whatItIs: { type: String, default: '' },
  background: { type: String, default: '' },
  flavour: { type: String, default: '' },
  audience: { type: String, default: '' },
  packaging: { type: String, default: '' },
  info: { type: String, default: '' },
  originCountry: { type: String, default: 'South Africa' },
  brand: { type: String, default: '' },
  ingredients: { type: String, default: '' },
  allergens: { type: String, default: '' },
  storage: { type: String, default: '' },
  nutrition: { type: String, default: '' },
  pairings: { type: [String], default: [] },
  servingIdeas: { type: [String], default: [] },
  faq: { type: [FaqSchema], default: [] },
  seo: { type: SeoSchema, default: () => ({}) },
  dimensions: { type: DimensionsSchema, default: () => ({}) },
  parcel: { type: ParcelSchema, default: () => ({}) },
  inventory: { type: InventorySchema, default: () => ({}) },
  updatedBy: { type: String, default: '' }
}, { timestamps: true });

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
