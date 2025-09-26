// scripts/seedAll.js
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Hospital from '../models/Hospital.js';
import Appointment from '../models/Appointment.js';

dotenv.config({ path: '../.env' });

// Admin data
const adminData = {
  name: "Admin User",
  email: "admin@email.com",
  password: "@admin123",
  role: "admin"
};

// Patient data
const patientsData = [
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

// Therapist data
const therapistsData = [
  { name: "Dr. Arjun Patel", email: "arjun@email.com", password: "@arjun123", specialty: "Articulation Disorder" },
  { name: "Dr. Priya Sharma", email: "priya@email.com", password: "@priya123", specialty: "Stuttering" },
  { name: "Dr. Rajesh Kumar", email: "rajesh@email.com", password: "@rajesh123", specialty: "Language Delay" },
  { name: "Dr. Sneha Gupta", email: "sneha@email.com", password: "@sneha123", specialty: "Voice Disorder" },
  { name: "Dr. Vikram Singh", email: "vikram@email.com", password: "@vikram123", specialty: "Pediatric Speech Therapy" },
  { name: "Dr. Anjali Reddy", email: "anjali@email.com", password: "@anjali123", specialty: "Swallowing Disorders (Dysphagia)" },
  { name: "Dr. Rohit Agarwal", email: "rohit@email.com", password: "@rohit123", specialty: "Aphasia Rehabilitation" },
  { name: "Dr. Kavya Nair", email: "kavya@email.com", password: "@kavya123", specialty: "Articulation Disorder" },
  { name: "Dr. Suresh Iyer", email: "suresh@email.com", password: "@suresh123", specialty: "Stuttering" },
  { name: "Dr. Meera Joshi", email: "meera@email.com", password: "@meera123", specialty: "Language Delay" },
  { name: "Dr. Rohan Desai", email: "rohan@email.com", password: "@rohan123", specialty: "Voice Disorder" },
  { name: "Dr. Aisha Khan", email: "aisha@email.com", password: "@aisha123", specialty: "Pediatric Speech Therapy" },
  { name: "Dr. Suresh Patel", email: "suresh.patel@email.com", password: "@suresh123", specialty: "Swallowing Disorders (Dysphagia)" },
  { name: "Dr. Kavya Sharma", email: "kavya.sharma@email.com", password: "@kavya123", specialty: "Aphasia Rehabilitation" },
  { name: "therapist", email: "therapist@email.com", password: "@therapist123", specialty: "General Speech Therapy" },
  { name: "Dr. Deepak Verma", email: "deepak@email.com", password: "@deepak123", specialty: "Articulation Disorder" },
  { name: "Dr. Pooja Agarwal", email: "pooja@email.com", password: "@pooja123", specialty: "Stuttering" },
  { name: "Dr. Rahul Jain", email: "rahul@email.com", password: "@rahul123", specialty: "Language Delay" },
  { name: "Dr. Neha Singh", email: "neha@email.com", password: "@neha123", specialty: "Voice Disorder" },
  { name: "Dr. Amit Kumar", email: "amit@email.com", password: "@amit123", specialty: "Pediatric Speech Therapy" },
  { name: "Dr. Shruti Patel", email: "shruti@email.com", password: "@shruti123", specialty: "Swallowing Disorders (Dysphagia)" },
  { name: "Dr. Vikas Reddy", email: "vikas@email.com", password: "@vikas123", specialty: "Aphasia Rehabilitation" },
  { name: "Dr. Sunita Iyer", email: "sunita@email.com", password: "@sunita123", specialty: "Articulation Disorder" },
  { name: "Dr. Manish Gupta", email: "manish@email.com", password: "@manish123", specialty: "Stuttering" },
  { name: "Dr. Rekha Sharma", email: "rekha@email.com", password: "@rekha123", specialty: "Language Delay" },
  { name: "Dr. Sanjay Nair", email: "sanjay@email.com", password: "@sanjay123", specialty: "Voice Disorder" },
  { name: "Dr. Priyanka Joshi", email: "priyanka@email.com", password: "@priyanka123", specialty: "Pediatric Speech Therapy" },
  { name: "Dr. Rajesh Desai", email: "rajesh.desai@email.com", password: "@rajesh123", specialty: "Swallowing Disorders (Dysphagia)" },
  { name: "Dr. Kavita Agarwal", email: "kavita@email.com", password: "@kavita123", specialty: "Aphasia Rehabilitation" },
  { name: "Dr. Nitin Kumar", email: "nitin@email.com", password: "@nitin123", specialty: "General Speech Therapy" }
];

// Hospital data
const hospitalsData = [
  { name: "All India Institute of Medical Sciences (AIIMS)", slug: "aiims" },
  { name: "Apollo Hospitals - Speech Therapy Center", slug: "apollo" },
  { name: "Fortis Healthcare - Speech & Hearing Department", slug: "fortis" },
  { name: "Max Healthcare - Speech Language Pathology", slug: "max" },
  { name: "Manipal Hospitals - Communication Disorders Unit", slug: "manipal" },
  { name: "Kokilaben Dhirubhai Ambani Hospital - Speech Therapy", slug: "kokilaben" },
  { name: "Medanta - The Medicity - Speech & Language Center", slug: "medanta" }
];

async function seedAll() {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    console.error("Error: MONGODB_URI is not defined in .env file");
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGODB_URI);
    console.log("MongoDB connected successfully.");

    // Clear all collections first
    console.log("Clearing all collections...");
    await User.deleteMany({});
    await Hospital.deleteMany({});
    await Appointment.deleteMany({});
    console.log("All collections cleared.");

    // Seed hospitals first
    console.log("\nSeeding hospitals...");
    const hospitals = [];
    for (const hospitalData of hospitalsData) {
      const hospital = new Hospital(hospitalData);
      await hospital.save();
      hospitals.push(hospital);
      console.log(`Inserted: ${hospitalData.name}`);
    }

    // Seed admin
    console.log("\nSeeding admin...");
    const admin = new User(adminData);
    await admin.save();
    console.log(`Inserted: ${adminData.name} (${adminData.email})`);

    // Seed patients
    console.log("\nSeeding patients...");
    const patients = [];
    for (let i = 0; i < patientsData.length; i++) {
      const patientData = patientsData[i];
      const hospital = hospitals[i % hospitals.length];
      const fullPatientData = {
        ...patientData,
        role: 'patient',
        hospitalId: hospital._id,
        phone: `9876543${String(i).padStart(3, '0')}`
      };
      const patient = new User(fullPatientData);
      await patient.save();
      patients.push(patient);
      console.log(`Inserted: ${patientData.name} (${patientData.email}) assigned to ${hospital.name}`);
    }

    // Seed therapists
    console.log("\nSeeding therapists...");
    const therapists = [];
    for (let i = 0; i < therapistsData.length; i++) {
      const therapistData = therapistsData[i];
      const hospital = hospitals[i % hospitals.length];
      const fullTherapistData = {
        ...therapistData,
        role: 'therapist',
        hospitalId: hospital._id,
        phone: `9876543${String(i + 100).padStart(3, '0')}`,
        profilePictureUrl: "/placeholder.svg?height=80&width=80"
      };
      const therapist = new User(fullTherapistData);
      await therapist.save();
      therapists.push(therapist);
      console.log(`Inserted: ${therapistData.name} (${therapistData.email}) assigned to ${hospital.name}`);
    }

    console.log(`\nSeeding complete!`);
    console.log(`- Admin: 1 user`);
    console.log(`- Patients: ${patients.length} users`);
    console.log(`- Therapists: ${therapists.length} users`);
    console.log(`- Hospitals: ${hospitals.length} hospitals`);

  } catch (error) {
    console.error("\nError seeding database:", error);
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

seedAll();
