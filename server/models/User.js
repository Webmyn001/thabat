import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  id: { type: String, unique: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, default: "" },
  role: { type: String, enum: ['participant', 'admin'], default: 'participant' },
  isEmailVerified: { type: Boolean, default: false },
  emailVerifiedAt: { type: Date },
  hifzDeclarationAccepted: { type: Boolean, default: true },
  hifzDeclarationAcceptedAt: { type: Date, default: Date.now },
  preferredLanguage: { type: String, enum: ['ar', 'en'], default: 'en' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const User = mongoose.model('User', UserSchema);
