// scripts/seedHospitals.js
import dotenv from 'dotenv'; // Load .env file from parent directory
import mongoose from 'mongoose';
import Hospital from '../models/Hospital.js'; 

dotenv.config({ path: '../.env' });

const hospitalsToSeed = [
  { name: "All India Institute of Medical Sciences (AIIMS)", slug: "aiims" },
  { name: "Apollo Hospitals - Speech Therapy Center", slug: "apollo" },
  { name: "Fortis Healthcare - Speech & Hearing Department", slug: "fortis" },
  { name: "Max Healthcare - Speech Language Pathology", slug: "max" },
  { name: "Manipal Hospitals - Communication Disorders Unit", slug: "manipal" },
  { name: "Kokilaben Dhirubhai Ambani Hospital - Speech Therapy", slug: "kokilaben" },
  { name: "Medanta - The Medicity - Speech & Language Center", slug: "medanta" }
];

async function seedDB() {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    console.error("Error: MONGODB_URI is not defined in .env file");
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGODB_URI);
    console.log("MongoDB connected successfully.");

    let insertedCount = 0;
    let skippedCount = 0;

    for (const hospitalData of hospitalsToSeed) {
      // Check if hospital with the same slug already exists
      const existingHospital = await Hospital.findOne({ slug: hospitalData.slug });

      if (!existingHospital) {
        const hospital = new Hospital(hospitalData);
        await hospital.save();
        insertedCount++;
        console.log(`Inserted: ${hospitalData.name}`);
      } else {
        skippedCount++;
        console.log(`Skipped (already exists): ${hospitalData.name}`);
      }
    }

    console.log(`\nSeeding complete. Inserted: ${insertedCount}, Skipped: ${skippedCount}`);

  } catch (error) {
    console.error("\nError seeding database:", error);
    process.exit(1);
  } finally {
    // Ensure disconnection even if errors occurred during seeding
    try {
        await mongoose.disconnect();
        console.log("MongoDB disconnected.");
    } catch (disconnectError) {
        console.error("Error disconnecting MongoDB:", disconnectError);
    }
  }
}

seedDB(); 