import mongoose from 'mongoose';

const ItemSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  sku: { type: String, default: '' },
  name: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true, min: 0 },
  vatRate: { type: Number, min: 0, default: 27 }
}, { _id: false });

const StatusHistorySchema = new mongoose.Schema({
  field: { type: String, required: true },
  from: { type: String, default: '' },
  to: { type: String, required: true },
  changedBy: { type: String, default: '' },
  note: { type: String, default: '' },
  at: { type: Date, default: Date.now }
}, { _id: false });

const OrderSchema = new mongoose.Schema({
  reference: { type: String, required: true, unique: true },
  ssoUserId: { type: String, required: true, index: true },
  customerName: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  phone: { type: String, trim: true },
  address: { type: String, required: true, trim: true },
  billingName: { type: String, default: '' },
  billingAddress: { type: String, default: '' },
  taxNumber: { type: String, default: '' },
  items: { type: [ItemSchema], required: true },
  subtotal: { type: Number, min: 0, default: 0 },
  shippingFee: { type: Number, min: 0, default: 0 },
  discountTotal: { type: Number, min: 0, default: 0 },
  total: { type: Number, required: true, min: 0 },
  currency: { type: String, default: 'HUF' },
  orderStatus: { type: String, enum: ['created', 'bought', 'cancelled', 'refunded'], default: 'created', index: true },
  paymentStatus: { type: String, enum: ['not_started', 'pending', 'paid', 'failed', 'refunded'], default: 'not_started', index: true },
  invoiceStatus: { type: String, enum: ['not_started', 'pending', 'invoiced', 'failed', 'storno'], default: 'not_started', index: true },
  fulfilmentStatus: { type: String, enum: ['not_ready', 'picking', 'ready_to_deliver', 'handed_over'], default: 'not_ready', index: true },
  deliveryStatus: { type: String, enum: ['not_started', 'label_created', 'in_transit', 'delivered', 'failed', 'returned'], default: 'not_started', index: true },
  paymentProvider: { type: String, default: 'barion' },
  paymentTransactionId: { type: String, default: '' },
  paidAt: { type: Date, default: null },
  invoicingProvider: { type: String, default: 'billingo' },
  invoiceNumber: { type: String, default: '' },
  invoiceUrl: { type: String, default: '' },
  invoicedAt: { type: Date, default: null },
  fulfilmentProvider: { type: String, default: 'packeta' },
  packetaPointId: { type: String, default: '' },
  parcelId: { type: String, default: '' },
  trackingNumber: { type: String, default: '' },
  trackingUrl: { type: String, default: '' },
  readyAt: { type: Date, default: null },
  handedOverAt: { type: Date, default: null },
  deliveredAt: { type: Date, default: null },
  customerNote: { type: String, default: '' },
  adminNote: { type: String, default: '' },
  statusHistory: { type: [StatusHistorySchema], default: [] },
  status: { type: String, enum: ['new', 'confirmed', 'fulfilled', 'cancelled'], default: 'new' }
}, { timestamps: true });

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
