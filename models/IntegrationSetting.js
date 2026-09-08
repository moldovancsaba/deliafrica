import mongoose from 'mongoose';

const IntegrationSettingSchema = new mongoose.Schema({
  provider: { type: String, required: true, unique: true, index: true },
  enabled: { type: Boolean, default: false },
  credentials: { type: mongoose.Schema.Types.Mixed, default: {} },
  publicConfig: { type: mongoose.Schema.Types.Mixed, default: {} },
  updatedBy: { type: String, default: '' }
}, { timestamps: true });

export default mongoose.models.IntegrationSetting || mongoose.model('IntegrationSetting', IntegrationSettingSchema);
