import mongoose from 'mongoose';

const CertificateSchema = new mongoose.Schema({
  id: { type: String, unique: true },
  certificateNumber: { type: String, required: true, unique: true },
  userId: { type: String, required: true, index: true },
  participantName: { type: String, required: true },
  issueDate: { type: String, required: true },
  totalSessionsCompleted: { type: Number, required: true },
  missedDaysCount: { type: Number, default: 0 },
  scorePercent: { type: Number, required: true },
  gradeTitleEn: { type: String, required: true },
  gradeTitleAr: { type: String, required: true },
  directorNameEn: { type: String, default: "Bello Muhyideen" },
  directorNameAr: { type: String, default: "بيلو محي الدين" },
  signatureTitleEn: { type: String, default: "Programme Director & Founder" },
  signatureTitleAr: { type: String, default: "مدير البرنامج والمؤسس" },
  signatureImage: { type: String, default: "" },
  downloadCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

export const Certificate = mongoose.model('Certificate', CertificateSchema);
