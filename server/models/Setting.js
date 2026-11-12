import mongoose from 'mongoose';

const SettingSchema = new mongoose.Schema({
  appNameEn: { type: String, default: "THABĀT" },
  appNameAr: { type: String, default: "ثبات" },
  taglineEn: { type: String, default: "Strengthening Hifz Through Consistency." },
  taglineAr: { type: String, default: "تثبيت الحفظ بدوام المداومة" },
  descriptorEn: { type: String, default: "90-Day Qur'an Revision Programme" },
  descriptorAr: { type: String, default: "برنامج مراجعة القرآن الكريم في 90 يوماً" },
  directorNameEn: { type: String, default: "Bello Muhyideen" },
  directorNameAr: { type: String, default: "بَلُّو محيي الدين" },
  signatureTitleEn: { type: String, default: "Programme Director & Founder" },
  signatureTitleAr: { type: String, default: "مدير البرنامج والمؤسس" },
  signatureImage: { type: String, default: "" },
  minCompletionScorePercent: { type: Number, default: 85 }
});

export const Setting = mongoose.model('Setting', SettingSchema);
