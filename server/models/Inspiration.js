import mongoose from 'mongoose';

const InspirationSchema = new mongoose.Schema({
  day: { type: Number, required: true, unique: true },
  arabic: { type: String, required: true },
  english: { type: String, required: true },
  source: { type: String, required: true },
  sourceAr: { type: String },
  category: { type: String, default: 'hadith' }
});

export const Inspiration = mongoose.model('Inspiration', InspirationSchema);
