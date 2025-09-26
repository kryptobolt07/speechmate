// scripts/seedTherapists.js
import dotenv from 'dotenv'; // Load .env variables from root
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs'; // Need bcrypt if we were hashing here, but pre-save hook handles it
import User from '../models/User.js';
import Hospital from '../models/Hospital.js';

dotenv.config({ path: '../.env' });

const therapistsToSeed = [
  {
    name: "Dr. Arjun Patel",
    email: "arjun@email.com",
    password: "@arjun123",
    phone: "9876543210",
    specialty: "Articulation Disorder",
    profilePictureUrl: "/placeholder.svg?height=80&width=80",
  },
  {
    name: "Dr. Priya Sharma",
    email: "priya@email.com",
    password: "@priya123",
    phone: "9876543211",
    specialty: "Stuttering",
    profilePictureUrl: "/placeholder.svg?height=80&width=80",
  },
  {
    name: "Dr. Rajesh Kumar",
    email: "rajesh@email.com",
    password: "@rajesh123",
    phone: "9876543212",
    specialty: "Language Delay",
    profilePictureUrl: "/placeholder.svg?height=80&width=80",
  },
  {
    name: "Dr. Sneha Gupta",
    email: "sneha@email.com",
    password: "@sneha123",
    phone: "9876543213",
    specialty: "Voice Disorder",
    profilePictureUrl: "/placeholder.svg?height=80&width=80",
  },
  {
    name: "Dr. Vikram Singh",
    email: "vikram@email.com",
    password: "@vikram123",
    phone: "9876543214",
    specialty: "Pediatric Speech Therapy",
    profilePictureUrl: "/placeholder.svg?height=80&width=80",
  },
  {
    name: "Dr. Anjali Reddy",
    email: "anjali@email.com",
    password: "@anjali123",
    phone: "9876543215",
    specialty: "Swallowing Disorders (Dysphagia)",
    profilePictureUrl: "/placeholder.svg?height=80&width=80",
  },
  {
    name: "Dr. Rohit Agarwal",
    email: "rohit@email.com",
    password: "@rohit123",
    phone: "9876543216",
    specialty: "Aphasia Rehabilitation",
    profilePictureUrl: "/placeholder.svg?height=80&width=80",
  },
  {
    name: "Dr. Kavya Nair",
    email: "kavya@email.com",
    password: "@kavya123",
    phone: "9876543217",
    specialty: "Articulation Disorder",
    profilePictureUrl: "/placeholder.svg?height=80&width=80",
  },
  {
    name: "Dr. Suresh Iyer",
    email: "suresh@email.com",
    password: "@suresh123",
    phone: "9876543218",
    specialty: "Stuttering",
    profilePictureUrl: "/placeholder.svg?height=80&width=80",
  },
  {
    name: "Dr. Meera Joshi",
    email: "meera@email.com",
    password: "@meera123",
    phone: "9876543219",
    specialty: "Language Delay",
    profilePictureUrl: "/placeholder.svg?height=80&width=80",
  },
  {
    name: "Dr. Rohan Desai",
    email: "rohan@email.com",
    password: "@rohan123",
    phone: "9876543220",
    specialty: "Voice Disorder",
    profilePictureUrl: "/placeholder.svg?height=80&width=80",
  },
  {
    name: "Dr. Aisha Khan",
    email: "aisha@email.com",
    password: "@aisha123",
    phone: "9876543221",
    specialty: "Pediatric Speech Therapy",
    profilePictureUrl: "/placeholder.svg?height=80&width=80",
  },
  {
    name: "Dr. Suresh Patel",
    email: "suresh.patel@email.com",
    password: "@suresh123",
    phone: "9876543222",
    specialty: "Swallowing Disorders (Dysphagia)",
    profilePictureUrl: "/placeholder.svg?height=80&width=80",
  },
  {
    name: "Dr. Kavya Sharma",
    email: "kavya.sharma@email.com",
    password: "@kavya123",
    phone: "9876543223",
    specialty: "Aphasia Rehabilitation",
    profilePictureUrl: "/placeholder.svg?height=80&width=80",
  },
  {
    name: "therapist",
    email: "therapist@email.com",
    password: "@therapist123",
    phone: "9876543224",
    specialty: "General Speech Therapy",
    profilePictureUrl: "/placeholder.svg?height=80&width=80",
  },
  {
    name: "Dr. Deepak Verma",
    email: "deepak@email.com",
    password: "@deepak123",
    phone: "9876543225",
    specialty: "Articulation Disorder",
    profilePictureUrl: "/placeholder.svg?height=80&width=80",
  },
  {
    name: "Dr. Pooja Agarwal",
    email: "pooja@email.com",
    password: "@pooja123",
    phone: "9876543226",
    specialty: "Stuttering",
    profilePictureUrl: "/placeholder.svg?height=80&width=80",
  },
  {
    name: "Dr. Rahul Jain",
    email: "rahul@email.com",
    password: "@rahul123",
    phone: "9876543227",
    specialty: "Language Delay",
    profilePictureUrl: "/placeholder.svg?height=80&width=80",
  },
  {
    name: "Dr. Neha Singh",
    email: "neha@email.com",
    password: "@neha123",
    phone: "9876543228",
    specialty: "Voice Disorder",
    profilePictureUrl: "/placeholder.svg?height=80&width=80",
  },
  {
    name: "Dr. Amit Kumar",
    email: "amit@email.com",
    password: "@amit123",
    phone: "9876543229",
    specialty: "Pediatric Speech Therapy",
    profilePictureUrl: "/placeholder.svg?height=80&width=80",
  },
  {
    name: "Dr. Shruti Patel",
    email: "shruti@email.com",
    password: "@shruti123",
    phone: "9876543230",
    specialty: "Swallowing Disorders (Dysphagia)",
    profilePictureUrl: "/placeholder.svg?height=80&width=80",
  },
  {
    name: "Dr. Vikas Reddy",
    email: "vikas@email.com",
    password: "@vikas123",
    phone: "9876543231",
    specialty: "Aphasia Rehabilitation",
    profilePictureUrl: "/placeholder.svg?height=80&width=80",
  },
  {
    name: "Dr. Sunita Iyer",
    email: "sunita@email.com",
    password: "@sunita123",
    phone: "9876543232",
    specialty: "Articulation Disorder",
    profilePictureUrl: "/placeholder.svg?height=80&width=80",
  },
  {
    name: "Dr. Manish Gupta",
    email: "manish@email.com",
    password: "@manish123",
    phone: "9876543233",
    specialty: "Stuttering",
    profilePictureUrl: "/placeholder.svg?height=80&width=80",
  },
  {
    name: "Dr. Rekha Sharma",
    email: "rekha@email.com",
    password: "@rekha123",
    phone: "9876543234",
    specialty: "Language Delay",
    profilePictureUrl: "/placeholder.svg?height=80&width=80",
  },
  {
    name: "Dr. Sanjay Nair",
    email: "sanjay@email.com",
    password: "@sanjay123",
    phone: "9876543235",
    specialty: "Voice Disorder",
    profilePictureUrl: "/placeholder.svg?height=80&width=80",
  },
  {
    name: "Dr. Priyanka Joshi",
    email: "priyanka@email.com",
    password: "@priyanka123",
    phone: "9876543236",
    specialty: "Pediatric Speech Therapy",
    profilePictureUrl: "/placeholder.svg?height=80&width=80",
  },
  {
    name: "Dr. Rajesh Desai",
    email: "rajesh.desai@email.com",
    password: "@rajesh123",
    phone: "9876543237",
    specialty: "Swallowing Disorders (Dysphagia)",
    profilePictureUrl: "/placeholder.svg?height=80&width=80",
  },
  {
    name: "Dr. Kavita Agarwal",
    email: "kavita@email.com",
    password: "@kavita123",
    phone: "9876543238",
    specialty: "Aphasia Rehabilitation",
    profilePictureUrl: "/placeholder.svg?height=80&width=80",
  },
  {
    name: "Dr. Nitin Kumar",
    email: "nitin@email.com",
    password: "@nitin123",
    phone: "9876543239",
    specialty: "General Speech Therapy",
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