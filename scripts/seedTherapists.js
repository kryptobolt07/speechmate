// scripts/seedTherapists.js
require('dotenv').config({ path: '../.env' }); // Load .env variables from root
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Need bcrypt if we were hashing here, but pre-save hook handles it

// Access the .default property for CommonJS require of ES Module
const User = require('../models/User').default;
const Hospital = require('../models/Hospital').default;

const therapistsToSeed = [
  {
    name: "Dr. Priya Sharma",
    email: "priya.sharma@speechmate.com",
    password: "password123", // Will be hashed by pre-save hook
    phone: "9876543210",
    specialty: "Articulation Disorder",
    profilePictureUrl: "/placeholder.svg?height=80&width=80",
  },
  {
    name: "Dr. Arjun Kumar",
    email: "arjun.kumar@speechmate.com",
    password: "password123",
    phone: "9876543211",
    specialty: "Stuttering",
    profilePictureUrl: "/placeholder.svg?height=80&width=80",
  },
  {
    name: "Dr. Meera Chopra",
    email: "meera.chopra@speechmate.com",
    password: "password123",
    phone: "9876543212",
    specialty: "Language Delay",
    profilePictureUrl: "/placeholder.svg?height=80&width=80",
  },
  {
    name: "Dr. Rohan Desai",
    email: "rohan.desai@speechmate.com",
    password: "password123",
    phone: "9876543213",
    specialty: "Voice Disorder",
    profilePictureUrl: "/placeholder.svg?height=80&width=80",
  },
  {
    name: "Dr. Anjali Singh",
    email: "anjali.singh@speechmate.com",
    password: "password123",
    phone: "9876543214",
    specialty: "Pediatric Speech Therapy",
    profilePictureUrl: "/placeholder.svg?height=80&width=80",
  },
  {
    name: "Dr. Vikram Nair",
    email: "vikram.nair@speechmate.com",
    password: "password123",
    phone: "9876543215",
    specialty: "Swallowing Disorders (Dysphagia)",
    profilePictureUrl: "/placeholder.svg?height=80&width=80",
  },
  {
    name: "Dr. Aisha Khan",
    email: "aisha.khan@speechmate.com",
    password: "password123",
    phone: "9876543216",
    specialty: "Aphasia Rehabilitation",
    profilePictureUrl: "/placeholder.svg?height=80&width=80",
  },
];

async function seedTherapists() {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    console.error("Error: MONGODB_URI is not defined in .env file");
    process.exit(1);
  }

  let connection;
  try {
    connection = await mongoose.connect(MONGODB_URI);
    console.log("MongoDB connected successfully.");

    // Fetch hospitals to assign hospital IDs
    const hospitals = await Hospital.find().lean();
    if (hospitals.length === 0) {
      console.error("Error: No hospitals found in the database. Please seed hospitals first (e.g., using scripts/seedHospitals.js).");
      process.exit(1);
    }
    console.log(`Found ${hospitals.length} hospitals to assign therapists to.`);

    let insertedCount = 0;
    let skippedCount = 0;

    for (let i = 0; i < therapistsToSeed.length; i++) {
      const therapistData = therapistsToSeed[i];

      // Check if user with the same email already exists
      const existingUser = await User.findOne({ email: therapistData.email });

      if (!existingUser) {
        // Assign a hospital ID (cycling through the available hospitals)
        const hospital = hospitals[i % hospitals.length];
        const fullTherapistData = {
          ...therapistData,
          role: 'therapist', // Explicitly set role
          hospitalId: hospital._id, // Assign ObjectId
        };

        const therapist = new User(fullTherapistData);
        await therapist.save(); // The pre-save hook in UserSchema will hash the password
        insertedCount++;
        console.log(`Inserted: ${therapistData.name} (Email: ${therapistData.email}) assigned to ${hospital.name}`);
      } else {
        skippedCount++;
        console.log(`Skipped (already exists): ${therapistData.name} (Email: ${therapistData.email})`);
      }
    }

    console.log(`\nSeeding therapists complete. Inserted: ${insertedCount}, Skipped: ${skippedCount}`);

  } catch (error) {
    console.error("\nError seeding therapists database:", error);
    process.exit(1);
  } finally {
    if (connection) {
        try {
            await mongoose.disconnect();
            console.log("MongoDB disconnected.");
        } catch (disconnectError) {
            console.error("Error disconnecting MongoDB:", disconnectError);
        }
    }
  }
}

// Execute the seeding function
seedTherapists(); 