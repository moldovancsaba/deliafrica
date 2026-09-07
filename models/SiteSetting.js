import mongoose from 'mongoose';

const SiteSettingSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, index: true },
  value: { type: String, required: true },
  updatedBy: { type: String, default: '' }
}, { timestamps: true });

export default mongoose.models.SiteSetting || mongoose.model('SiteSetting', SiteSettingSchema);
