import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Appointment from "@/models/Appointment"
import User from "@/models/User"
import Hospital from "@/models/Hospital"

export async function GET(request, { params }) {
  try {
    await dbConnect()
    
    const { id } = params
    const appointment = await Appointment.findById(id)
      .populate('patientId', 'name email')
      .populate('therapistId', 'name specialty')
      .populate('hospitalId', 'name')
    
    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 })
    }
    
    return NextResponse.json(appointment)
  } catch (error) {
    console.error("Error fetching appointment:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    await dbConnect()
    
    const { id } = params
    const updateData = await request.json()
    
    // Remove fields that shouldn't be updated
    delete updateData._id
    delete updateData.createdAt
    
    const appointment = await Appointment.findByIdAndUpdate(
      id,
      updateData,
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
    console.error("Error updating appointment:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    await dbConnect()
    
    const { id } = params
    const appointment = await Appointment.findByIdAndDelete(id)
    
    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 })
    }
    
    return NextResponse.json({ message: "Appointment deleted successfully" })
  } catch (error) {
    console.error("Error deleting appointment:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
