import mongoose from 'mongoose';

const AppointmentSchema = new mongoose.Schema({
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
  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    required: [true, 'Hospital ID is required.'],
  },
  appointmentDate: {
    type: Date,
    required: [true, 'Appointment date is required.'],
  },
  appointmentTime: {
    type: String, // e.g., "10:00 AM"
    required: [true, 'Appointment time is required.'],
    // Consider validation for time format
  },
  duration: {
    type: Number, // Duration in minutes
    required: [true, 'Appointment duration is required.'],
    default: 45, // Default duration
  },
  type: {
    type: String,
    enum: ['Initial Assessment', 'Follow-up', 'Speech Therapy', 'Consultation'],
    required: [true, 'Appointment type is required.'],
    default: 'Speech Therapy',
  },
  condition: {
    type: String, // Condition being treated, e.g., "Articulation Disorder"
    // Could be derived from patient or specified at booking
  },
  notes: {
    type: String, // Optional notes from patient at booking
    trim: true,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed', 'no-show'],
    required: true,
    default: 'pending',
    index: true,
  },
  therapistNotes: {
    type: String, // Notes added by therapist post-session
    trim: true,
  },
  patientFeedback: {
     // Could link to a separate Review model later
     rating: Number, 
     comment: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Combine date and time for easier querying if needed, or add specific indexes
AppointmentSchema.index({ therapistId: 1, appointmentDate: 1, appointmentTime: 1 }, { unique: true }); // Prevent double booking for same therapist at exact same time
AppointmentSchema.index({ patientId: 1, appointmentDate: 1 });

export default mongoose.models.Appointment || mongoose.model('Appointment', AppointmentSchema); 