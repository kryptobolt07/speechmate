import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Appointment from "@/models/Appointment"

export async function PUT(request, { params }) {
  try {
    await dbConnect()
    
    const { id } = params
    
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

    if (!userId || role !== 'therapist') {
      return NextResponse.json({ error: "Unauthorized - Only therapists can complete sessions" }, { status: 403 })
    }

    const appointment = await Appointment.findByIdAndUpdate(
      id,
      { status: 'completed' },
      { new: true, runValidators: true }
    )
      .populate('patientId', 'name email')
      .populate('therapistId', 'name specialty')
      .populate('hospitalId', 'name')
    
    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 })
    }

    // Verify the therapist owns this appointment
    if (appointment.therapistId._id.toString() !== userId) {
      return NextResponse.json({ error: "Unauthorized - You can only complete your own appointments" }, { status: 403 })
    }
    
    return NextResponse.json({
      success: true,
      appointment,
      message: "Session marked as completed successfully"
    })
  } catch (error) {
    console.error("Error completing appointment:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
