// scripts/clearTherapists.js
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';

dotenv.config({ path: '../.env' });

async function clearTherapists() {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    console.error("Error: MONGODB_URI is not defined in .env file");
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGODB_URI);
    console.log("MongoDB connected successfully.");

    // Delete all users with role 'therapist'
    const result = await User.deleteMany({ role: 'therapist' });
    console.log(`Deleted ${result.deletedCount} therapists from the database.`);

    console.log("Therapists cleared successfully.");

  } catch (error) {
    console.error("\nError clearing therapists:", error);
    process.exit(1);
  } finally {
    try {
      await mongoose.disconnect();
      console.log("MongoDB disconnected.");
    } catch (disconnectError) {
      console.error("Error disconnecting MongoDB:", disconnectError);
    }
  }
}

clearTherapists();
