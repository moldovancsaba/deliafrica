import mongoose from 'mongoose';

const AddressSchema = new mongoose.Schema({
  recipientName: { type: String, default: '', trim: true },
  phone: { type: String, default: '', trim: true },
  country: { type: String, default: 'Hungary', trim: true },
  postalCode: { type: String, default: '', trim: true },
  city: { type: String, default: '', trim: true },
  addressLine1: { type: String, default: '', trim: true },
  addressLine2: { type: String, default: '', trim: true },
  deliveryNote: { type: String, default: '', trim: true }
}, { _id: false });

const BillingSchema = new mongoose.Schema({
  billingName: { type: String, default: '', trim: true },
  companyName: { type: String, default: '', trim: true },
  taxNumber: { type: String, default: '', trim: true },
  country: { type: String, default: 'Hungary', trim: true },
  postalCode: { type: String, default: '', trim: true },
  city: { type: String, default: '', trim: true },
  addressLine1: { type: String, default: '', trim: true },
  addressLine2: { type: String, default: '', trim: true }
}, { _id: false });

const UserSchema = new mongoose.Schema({
  ssoUserId: { type: String, required: true, unique: true, index: true },
  email: { type: String, default: '', trim: true, lowercase: true, index: true },
  name: { type: String, default: '', trim: true },
  phone: { type: String, default: '', trim: true },
  shippingAddress: { type: AddressSchema, default: () => ({}) },
  billingDetails: { type: BillingSchema, default: () => ({}) },
  ssoRole: { type: String, default: 'user' },
  ssoStatus: { type: String, default: 'unknown' },
  roleOverride: { type: String, enum: ['', 'user', 'admin'], default: '' },
  active: { type: Boolean, default: true },
  firstLoginAt: { type: Date, default: Date.now },
  lastLoginAt: { type: Date, default: Date.now },
  lastSeenAt: { type: Date, default: Date.now },
  updatedBy: { type: String, default: '' }
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);
