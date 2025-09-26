// scripts/seedPatients.js
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Hospital from '../models/Hospital.js';

dotenv.config({ path: '../.env' });

const patientsToSeed = [
  { name: "Arjun Patel", email: "arjun@email.com", password: "@arjun123" },
  { name: "Priya Sharma", email: "priya@email.com", password: "@priya123" },
  { name: "Rajesh Kumar", email: "rajesh@email.com", password: "@rajesh123" },
  { name: "Sneha Gupta", email: "sneha@email.com", password: "@sneha123" },
  { name: "Vikram Singh", email: "vikram@email.com", password: "@vikram123" },
  { name: "Anjali Reddy", email: "anjali@email.com", password: "@anjali123" },
  { name: "Rohit Agarwal", email: "rohit@email.com", password: "@rohit123" },
  { name: "Kavya Nair", email: "kavya@email.com", password: "@kavya123" },
  { name: "Suresh Iyer", email: "suresh@email.com", password: "@suresh123" },
  { name: "Meera Joshi", email: "meera@email.com", password: "@meera123" },
  { name: "patient", email: "patient@email.com", password: "@patient123" }
];

async function seedPatients() {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    console.error("Error: MONGODB_URI is not defined in .env file");
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGODB_URI);
    console.log("MongoDB connected successfully.");

    // Fetch hospitals to assign hospital IDs
    const hospitals = await Hospital.find().lean();
    if (hospitals.length === 0) {
      console.error("Error: No hospitals found in the database. Please seed hospitals first.");
      process.exit(1);
    }
    console.log(`Found ${hospitals.length} hospitals to assign patients to.`);

    let insertedCount = 0;
    let skippedCount = 0;

    for (let i = 0; i < patientsToSeed.length; i++) {
      const patientData = patientsToSeed[i];

      // Check if user with the same email already exists
      const existingUser = await User.findOne({ email: patientData.email });

      if (!existingUser) {
        // Assign a hospital ID (cycling through the available hospitals)
        const hospital = hospitals[i % hospitals.length];
        const fullPatientData = {
          ...patientData,
          role: 'patient',
          hospitalId: hospital._id,
          phone: `9876543${String(i).padStart(3, '0')}` // Generate phone numbers
        };

        const patient = new User(fullPatientData);
        await patient.save(); // The pre-save hook in UserSchema will hash the password
        insertedCount++;
        console.log(`Inserted: ${patientData.name} (Email: ${patientData.email}) assigned to ${hospital.name}`);
      } else {
        skippedCount++;
        console.log(`Skipped (already exists): ${patientData.name} (Email: ${patientData.email})`);
      }
    }

    console.log(`\nSeeding patients complete. Inserted: ${insertedCount}, Skipped: ${skippedCount}`);

  } catch (error) {
    console.error("\nError seeding patients database:", error);
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

seedPatients();
