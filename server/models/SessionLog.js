import mongoose from 'mongoose';

const SessionLogSchema = new mongoose.Schema({
  id: { type: String, unique: true },
  userId: { type: String, required: true, index: true },
  sessionId: { type: String, required: true },
  programDay: { type: Number, required: true },
  sessionType: { type: String, required: true },
  isCompleted: { type: Boolean, default: false },
  completedAt: { type: Date },
  completedDate: { type: String },
  updatedAt: { type: Date, default: Date.now }
});

SessionLogSchema.index({ userId: 1, sessionId: 1 });

export const SessionLog = mongoose.model('SessionLog', SessionLogSchema);
