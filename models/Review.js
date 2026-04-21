import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Patient ID is required.'],
    index: true,
  },
  therapistId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Therapist ID is required.'],
    index: true,
  },
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: [true, 'Appointment ID is required.'],
    unique: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  survey: {
    communication:   { type: Number, min: 1, max: 5 },
    punctuality:     { type: Number, min: 1, max: 5 },
    effectiveness:   { type: Number, min: 1, max: 5 },
    friendliness:    { type: Number, min: 1, max: 5 },
    professionalism: { type: Number, min: 1, max: 5 },
  },
  comment: {
    type: String,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Review || mongoose.model('Review', ReviewSchema);
