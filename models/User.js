import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name.'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide an email.'],
    unique: true,
    match: [/.+\@.+\..+/, 'Please fill a valid email address'],
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Please provide a password.'],
    minlength: 6,
    select: false, // Do not return password by default
  },
  phone: {
    type: String,
    trim: true,
    // Add validation if needed (e.g., regex for phone number format)
  },
  role: {
    type: String,
    enum: ['patient', 'therapist', 'admin'],
    required: true,
    default: 'patient',
  },
  hospitalId: {
    // Assuming this will link to a Hospital collection later
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    // Not required for admin
  },
  // Therapist specific fields
  specialty: {
    type: String,
    // Only relevant if role is 'therapist'
  },
  profilePictureUrl: {
    type: String,
    // Only relevant if role is 'therapist'
  },
  // Patient specific fields
  assignedTherapistId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // References another User document (the therapist)
    // This field is primarily relevant for users with role: 'patient'
    // We might add a validator later to enforce this only for patients if needed
  },
  // e.g., medicalHistory, etc.

  // Admin specific fields (can add more as needed)

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving
UserSchema.pre('save', async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare entered password with hashed password
UserSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Prevent mongoose from recompiling the model if it already exists
export default mongoose.models.User || mongoose.model('User', UserSchema); 