import mongoose from 'mongoose';

const ItemSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true, min: 0 }
}, { _id: false });

const OrderSchema = new mongoose.Schema({
  reference: { type: String, required: true, unique: true },
  ssoUserId: { type: String, required: true, index: true },
  customerName: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  phone: { type: String, trim: true },
  address: { type: String, required: true, trim: true },
  items: { type: [ItemSchema], required: true },
  total: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ['new', 'confirmed', 'fulfilled', 'cancelled'], default: 'new' }
}, { timestamps: true });

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
