import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Appointment from "@/models/Appointment"

export async function PUT(request, { params }) {
  try {
    await dbConnect()
    
    const { id } = params
    const { appointmentDate, appointmentTime, notes } = await request.json()
    
    if (!appointmentDate || !appointmentTime) {
      return NextResponse.json({ 
        error: "appointmentDate and appointmentTime are required" 
      }, { status: 400 })
    }
    
    const appointment = await Appointment.findByIdAndUpdate(
      id,
      { 
        appointmentDate: new Date(appointmentDate),
        appointmentTime,
        notes: notes || undefined,
        status: 'pending' // Reset to pending when rescheduled
      },
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
    console.error("Error rescheduling appointment:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
