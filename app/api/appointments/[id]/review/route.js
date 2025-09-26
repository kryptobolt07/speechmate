import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Appointment from "@/models/Appointment"

export async function POST(request, { params }) {
  try {
    await dbConnect()
    
    const { id } = params
    const { rating, comment } = await request.json()
    
    // Get user payload from middleware
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

    const { userId, role } = userPayload

    if (!userId || role !== 'patient') {
      return NextResponse.json({ error: "Unauthorized - Only patients can submit reviews" }, { status: 403 })
    }

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 })
    }

    const appointment = await Appointment.findById(id)
      .populate('patientId', 'name email')
      .populate('therapistId', 'name specialty')
      .populate('hospitalId', 'name')
    
    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 })
    }

    // Verify the patient owns this appointment
    if (appointment.patientId._id.toString() !== userId) {
      return NextResponse.json({ error: "Unauthorized - You can only review your own appointments" }, { status: 403 })
    }

    // Check if appointment is completed
    if (appointment.status !== 'completed') {
      return NextResponse.json({ error: "You can only review completed sessions" }, { status: 400 })
    }

    // Check if already reviewed
    if (appointment.patientFeedback && appointment.patientFeedback.rating) {
      return NextResponse.json({ error: "You have already reviewed this session" }, { status: 400 })
    }

    // Update appointment with review
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      id,
      { 
        patientFeedback: {
          rating: parseInt(rating),
          comment: comment || ''
        }
      },
      { new: true, runValidators: true }
    )
      .populate('patientId', 'name email')
      .populate('therapistId', 'name specialty')
      .populate('hospitalId', 'name')
    
    return NextResponse.json({
      success: true,
      appointment: updatedAppointment,
      message: "Review submitted successfully"
    })
  } catch (error) {
    console.error("Error submitting review:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
