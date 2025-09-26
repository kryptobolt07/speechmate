import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Appointment from "@/models/Appointment"

export async function PUT(request, { params }) {
  try {
    await dbConnect()
    
    const { id } = params
    
    const appointment = await Appointment.findByIdAndUpdate(
      id,
      { status: 'confirmed' },
      { new: true, runValidators: true }
    )
      .populate('patientId', 'name email')
      .populate('therapistId', 'name specialty')
      .populate('hospitalId', 'name')
    
    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 })
    }
    
    return NextResponse.json(appointment)
  } catch (error) {
    console.error("Error confirming appointment:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
