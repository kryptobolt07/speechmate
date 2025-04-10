import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import User from "@/models/User"
import mongoose from "mongoose"

// POST handler to assign a therapist to a patient
export async function POST(request) {
  try {
    await dbConnect()

    // Verify admin role (from middleware)
    const userPayloadHeader = request.headers.get('x-user-payload');
    if (!userPayloadHeader) return NextResponse.json({ error: "Auth payload missing" }, { status: 401 });
    let userPayload; try { userPayload = JSON.parse(userPayloadHeader); } catch (e) { return NextResponse.json({ error: "Invalid auth payload" }, { status: 400 }); }
    if (userPayload.role !== 'admin') return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });

    const { patientId, therapistId } = await request.json()

    // Validate input
    if (!patientId || !therapistId) {
      return NextResponse.json({ error: "Missing patientId or therapistId" }, { status: 400 })
    }
    if (!mongoose.Types.ObjectId.isValid(patientId) || !mongoose.Types.ObjectId.isValid(therapistId)) {
         return NextResponse.json({ error: "Invalid patientId or therapistId format" }, { status: 400 });
    }

    // Verify patient exists and is indeed a patient
    const patient = await User.findOne({ _id: patientId, role: 'patient' });
    if (!patient) {
        return NextResponse.json({ error: "Patient not found or user is not a patient" }, { status: 404 });
    }
    
    // Verify therapist exists and is indeed a therapist
    const therapist = await User.findOne({ _id: therapistId, role: 'therapist' });
    if (!therapist) {
        return NextResponse.json({ error: "Therapist not found or user is not a therapist" }, { status: 404 });
    }

    // Update the patient's assignedTherapistId
    const updatedPatient = await User.findByIdAndUpdate(
      patientId,
      { $set: { assignedTherapistId: therapistId } },
      { new: true, runValidators: true } // Return updated doc, run schema validation
    ).select('name email assignedTherapistId'); // Select relevant fields

    if (!updatedPatient) {
      // This shouldn't happen if the findOne check passed, but good to have
      return NextResponse.json({ error: "Failed to update patient assignment" }, { status: 500 })
    }

    return NextResponse.json(
      {
        success: true,
        message: `Successfully assigned therapist ${therapist.name} to patient ${updatedPatient.name}.`,
        patient: updatedPatient
      }
    );

  } catch (error) {
    console.error("Error assigning therapist:", error)
    if (error.name === "ValidationError" || error.name === 'CastError') {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 