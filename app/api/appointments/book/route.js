import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Appointment from "@/models/Appointment"
import User from "@/models/User"
import Hospital from "@/models/Hospital"

export async function POST(request) {
  try {
    await dbConnect()

    // Get user payload injected by middleware (assuming patient is booking)
    const userPayloadHeader = request.headers.get('x-user-payload')
    if (!userPayloadHeader) {
      return NextResponse.json({ error: "Authentication data missing" }, { status: 401 })
    }
    let userPayload
    try {
      userPayload = JSON.parse(userPayloadHeader)
    } catch (e) {
      return NextResponse.json({ error: "Invalid authentication data format" }, { status: 400 })
    }
    const { userId: patientId, role } = userPayload // Assuming userId is the patient making the request

    // Optional: Could add check here that role is 'patient' if only patients can book
    // if (role !== 'patient') { ... }

    // Extract data from request body
    const {
      therapistId,
      appointmentDate,
      appointmentTime,
      type, // e.g., 'Initial Assessment'
      condition, // e.g., 'Articulation Disorder'
      duration, // Optional, defaults defined in schema
      notes, // Optional patient notes
    } = await request.json()

    // Validate required fields from body
    if (!therapistId || !appointmentDate || !appointmentTime || !type) {
      return NextResponse.json({ error: "Missing required fields: therapistId, appointmentDate, appointmentTime, type" }, { status: 400 })
    }

    // TODO: Add more robust validation:
    // 1. Check if therapistId is a valid User with role 'therapist'
    // 2. Check if appointmentDate is a valid future date
    // 3. Check if appointmentTime is a valid format and within working hours
    // 4. Check therapist availability at this specific date/time (prevent double booking - schema index helps but check first is better UX)
    // 5. Get hospitalId associated with the therapistId

    // For now, assume therapist exists and fetch their hospitalId
    const therapist = await User.findById(therapistId).select('hospitalId').lean();
    if (!therapist || !therapist.hospitalId) {
        return NextResponse.json({ error: "Therapist not found or missing hospital assignment" }, { status: 404 });
    }
    const hospitalId = therapist.hospitalId;

    // Create the new appointment document
    const newAppointment = new Appointment({
      patientId,
      therapistId,
      hospitalId, // Fetched from therapist
      appointmentDate: new Date(appointmentDate), // Ensure it's a Date object
      appointmentTime,
      duration, // Uses default from schema if not provided
      type,
      condition,
      notes,
      status: 'confirmed', // Default to confirmed, or could be 'pending' for admin approval
    })

    // Save the appointment to the database
    const savedAppointment = await newAppointment.save()

    // Mock successful booking // Return success response with appointment details
    // const appointmentId = `appointment-${Date.now()}`

    return NextResponse.json(
      {
        success: true,
        appointment: savedAppointment,
        message: "Appointment booked successfully",
      },
      { status: 201 } // 201 Created
    )
  } catch (error) {
    console.error("Booking error:", error)
    // Handle potential Mongoose validation errors or unique index conflicts
    if (error.name === "ValidationError") {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    if (error.code === 11000) { // Unique index violation (double booking)
        return NextResponse.json({ error: "Selected time slot is no longer available. Please choose another time." }, { status: 409 }); // 409 Conflict
    }
    return NextResponse.json({ error: "Internal server error during booking" }, { status: 500 })
  }
}

