import mongoose from 'mongoose';

const ProductSettingSchema = new mongoose.Schema({
  productId: { type: String, required: true, unique: true, index: true },
  widthMm: { type: Number, required: true, min: 1, max: 2000 },
  heightMm: { type: Number, required: true, min: 1, max: 2000 },
  updatedBy: { type: String, default: '' }
}, { timestamps: true });

export default mongoose.models.ProductSetting || mongoose.model('ProductSetting', ProductSettingSchema);
