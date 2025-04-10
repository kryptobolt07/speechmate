import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import User from "@/models/User"

// Removed mock patient data

export async function GET(request) {
  try {
    await dbConnect()

    // --- Authentication Simulation --- 
    // In a real app, verify JWT token and extract userId
    const authHeader = request.headers.get("Authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const mockToken = authHeader.split(" ")[1]
    const tokenParts = mockToken.split("-")
    // Assuming token format: mock-jwt-token-${userId}-${timestamp}
    if (tokenParts.length < 4 || tokenParts[0] !== "mock" || tokenParts[1] !== "jwt") {
        return NextResponse.json({ error: "Invalid token format" }, { status: 401 })
    }
    const userId = tokenParts[3] 
    // --- End Authentication Simulation ---

    if (!userId) {
       return NextResponse.json({ error: "Unauthorized - User ID missing" }, { status: 401 })
    }

    // Fetch the patient data from the database
    // Exclude password field explicitly
    const patient = await User.findById(userId).select("-password")

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 })
    }

    // Ensure the fetched user is actually a patient
    if (patient.role !== 'patient') {
        return NextResponse.json({ error: "Forbidden - User is not a patient" }, { status: 403 })
    }

    // In a real app, you might populate related data here:
    // const patientWithDetails = await User.findById(userId)
    //   .select("-password")
    //   .populate('assignedTherapistId') // Assuming a field linking to Therapist User
    //   .exec()
    // const appointments = await Appointment.find({ patientId: userId })
    // Return { ...patientWithDetails.toObject(), appointments }

    // Return the basic patient data for now
    return NextResponse.json(patient)

  } catch (error) {
    console.error("Error fetching patient data:", error)
    // Handle potential errors like invalid ObjectId format
    if (error.name === 'CastError') {
        return NextResponse.json({ error: "Invalid user ID format" }, { status: 400 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

