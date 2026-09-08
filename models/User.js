import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  ssoUserId: { type: String, required: true, unique: true, index: true },
  email: { type: String, default: '', trim: true, lowercase: true, index: true },
  name: { type: String, default: '', trim: true },
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
