// scripts/seedAdmin.js
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';

dotenv.config({ path: '../.env' }); // Load .env variables from the root directory

const MONGODB_URI = process.env.MONGODB_URI;

const ADMIN_EMAIL = 'admin@email.com';
const ADMIN_PASSWORD = '@admin123'; // This will be hashed by the model
const ADMIN_NAME = 'Admin User';

async function seedAdmin() {
  if (!MONGODB_URI) {
    console.error('Error: MONGODB_URI not found in .env file');
    process.exit(1);
  }

  console.log('Connecting to MongoDB...');
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected successfully.');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: ADMIN_EMAIL });

    if (existingAdmin) {
      console.log(`Admin user with email ${ADMIN_EMAIL} already exists.`);
    } else {
      console.log(`Creating admin user with email ${ADMIN_EMAIL}...`);
      const adminUser = new User({
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD, // The pre-save hook in the User model handles hashing
        role: 'admin',
        // Add any other required fields from your User schema with default/placeholder values
        // e.g., isVerified: true, // If you have email verification, maybe bypass for seed
      });

      await adminUser.save();
      console.log(`Admin user ${ADMIN_NAME} (${ADMIN_EMAIL}) created successfully.`);
    }

  } catch (error) {
    console.error('Error during admin seeding process:', error);
  } finally {
    // Ensure disconnection
    console.log('Disconnecting from MongoDB...');
    await mongoose.disconnect();
    console.log('MongoDB disconnected.');
  }
}

seedAdmin(); 