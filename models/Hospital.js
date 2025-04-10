import mongoose from 'mongoose';

const HospitalSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a hospital name.'],
    trim: true,
  },
  slug: {
    // This will match the values from the signup form dropdown ('north', 'east', etc.)
    type: String,
    required: [true, 'Please provide a unique slug.'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  // Add other hospital details as needed (e.g., address, phone)
});

export default mongoose.models.Hospital || mongoose.model('Hospital', HospitalSchema); 