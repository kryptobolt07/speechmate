// scripts/resetDB.js
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Hospital from '../models/Hospital.js';
import Appointment from '../models/Appointment.js';

dotenv.config({ path: '../.env' });

async function resetDB() {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    console.error("Error: MONGODB_URI is not defined in .env file");
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGODB_URI);
    console.log("MongoDB connected successfully.");

    // Clear all collections
    console.log("Clearing all collections...");
    
    const userResult = await User.deleteMany({});
    console.log(`Deleted ${userResult.deletedCount} users`);
    
    const hospitalResult = await Hospital.deleteMany({});
    console.log(`Deleted ${hospitalResult.deletedCount} hospitals`);
    
    const appointmentResult = await Appointment.deleteMany({});
    console.log(`Deleted ${appointmentResult.deletedCount} appointments`);

    console.log("\nDatabase reset complete. All data cleared.");

  } catch (error) {
    console.error("\nError resetting database:", error);
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

resetDB();
