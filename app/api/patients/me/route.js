import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import User from "@/models/User"

// Removed mock patient data

export async function GET(request) {
  try {
    await dbConnect()

    // Get user payload injected by middleware
    const userPayloadHeader = request.headers.get('x-user-payload')
    if (!userPayloadHeader) {
        // This should technically not happen if middleware is configured correctly
        console.error("User payload missing from request headers.")
        return NextResponse.json({ error: "Authentication data missing" }, { status: 500 })
    }

    let userPayload
    try {
        userPayload = JSON.parse(userPayloadHeader)
    } catch (e) {
        console.error("Failed to parse user payload header:", e)
        return NextResponse.json({ error: "Invalid authentication data" }, { status: 500 })
    }

    const { userId, role } = userPayload

    if (!userId) {
        // Should also not happen if middleware and token generation are correct
        console.error("User ID missing from payload.")
       return NextResponse.json({ error: "Unauthorized - User ID missing from token" }, { status: 401 })
    }

    // Optional: Verify the role if needed for this specific endpoint
    if (role !== 'patient') {
      return NextResponse.json({ error: "Forbidden - Insufficient role" }, { status: 403 })
    }

    // Fetch the patient data from the database using the verified userId
    const patient = await User.findById(userId).select("-password")

    if (!patient) {
        // This might happen if the user was deleted after the token was issued
       return NextResponse.json({ error: "Patient not found" }, { status: 404 })
    }

    // Ensure the fetched user's role matches (redundant check here, but safe)
    if (patient.role !== 'patient') {
        console.warn(`Mismatch: Token role '${role}' vs DB role '${patient.role}' for user ${userId}`)
        return NextResponse.json({ error: "Forbidden - Role mismatch" }, { status: 403 })
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

