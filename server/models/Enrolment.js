import mongoose from 'mongoose';

const EnrolmentSchema = new mongoose.Schema({
  id: { type: String, unique: true },
  userId: { type: String, required: true, index: true },
  startDate: { type: String, required: true },
  currentProgramDay: { type: Number, default: 1 },
  currentPhase: { type: Number, default: 1 },
  isCompleted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const Enrolment = mongoose.model('Enrolment', EnrolmentSchema);
