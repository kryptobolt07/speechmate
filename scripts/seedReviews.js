/**
 * scripts/seedReviews.js
 * Run with: node scripts/seedReviews.js
 * Seeds completed appointments AND matching reviews for all therapists.
 */
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Appointment from '../models/Appointment.js';
import Review from '../models/Review.js';
import Hospital from '../models/Hospital.js';

dotenv.config({ path: './.env' });

const COMMENTS = [
  "Great session — I can feel real progress!",
  "Very professional and easy to talk to.",
  "Exercises were clear and practical, love it.",
  "The therapist was patient and encouraging.",
  "Fantastic job explaining everything step by step.",
  "Session ended on time, efficient and thorough.",
  "Friendly environment, felt very comfortable.",
  "Already noticing improvements after a few sessions.",
  "Could have gone into more depth, but overall good.",
  "Really helped me understand my condition better.",
];

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)] }
function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min }

async function run() {
  const URI = process.env.MONGODB_URI;
  if (!URI) { console.error("MONGODB_URI not set"); process.exit(1); }

  await mongoose.connect(URI);
  console.log("Connected.");

  // Clear old
  await Review.deleteMany({});
  await Appointment.deleteMany({});
  console.log("Cleared old appointments and reviews.");

  const therapists = await User.find({ role: 'therapist' });
  const patients   = await User.find({ role: 'patient' });
  const hospitals  = await Hospital.find({});

  if (!therapists.length || !patients.length || !hospitals.length) {
    console.error("Missing base data — run seedAll.js first.");
    mongoose.disconnect(); process.exit(1);
  }

  let reviewCount = 0;

  for (const therapist of therapists) {
    const reviewsToMake = rand(2, 5);
    for (let i = 0; i < reviewsToMake; i++) {
      const patient  = pick(patients);
      const hospital = pick(hospitals);
      const daysAgo  = rand(1, 90);
      const apptDate = new Date(Date.now() - daysAgo * 86400000);
      apptDate.setHours(rand(8, 17), 0, 0, 0);

      // Therapist time uniqueness is enforced — use different hours
      let appointment;
      try {
        appointment = await Appointment.create({
          patientId:       patient._id,
          therapistId:     therapist._id,
          hospitalId:      hospital._id,
          appointmentDate: apptDate,
          appointmentTime: `${String(apptDate.getHours()).padStart(2,'0')}:00`,
          duration:        45,
          status:          'completed',
          condition:       therapist.specialty || 'General Speech Therapy',
          type:            'Speech Therapy',
          patientFeedback: {},
        });
      } catch {
        // Skip duplicate time-slot conflict
        continue;
      }

      const rating = rand(3, 5);
      await Review.create({
        patientId:   patient._id,
        therapistId: therapist._id,
        appointmentId: appointment._id,
        rating,
        survey: {
          communication:   rand(3, 5),
          punctuality:     rand(3, 5),
          effectiveness:   rand(3, 5),
          friendliness:    rand(4, 5),
          professionalism: rand(3, 5),
        },
        comment: Math.random() > 0.3 ? pick(COMMENTS) : "",
        createdAt: apptDate,
      });

      // Update appointment patientFeedback
      await Appointment.findByIdAndUpdate(appointment._id, { 'patientFeedback.rating': rating });
      reviewCount++;
    }
  }

  console.log(`Seeded ${reviewCount} reviews across ${therapists.length} therapists.`);
  await mongoose.disconnect();
}

run().catch(e => { console.error(e); process.exit(1); });
