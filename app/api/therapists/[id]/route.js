import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import User from "@/models/User"
import Hospital from "@/models/Hospital"

export async function GET(request, { params }) {
  try {
    await dbConnect()
    
    const { id } = params
    const therapist = await User.findById(id)
      .populate('hospitalId', 'name')
      .select('-password')
    
    if (!therapist) {
      return NextResponse.json({ error: "Therapist not found" }, { status: 404 })
    }
    
    return NextResponse.json(therapist)
  } catch (error) {
    console.error("Error fetching therapist:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    await dbConnect()
    
    const { id } = params
    const updateData = await request.json()
    
    // Remove sensitive fields that shouldn't be updated
    delete updateData.password
    delete updateData.role
    delete updateData._id
    delete updateData.createdAt
    
    const therapist = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('hospitalId', 'name')
    
    if (!therapist) {
      return NextResponse.json({ error: "Therapist not found" }, { status: 404 })
    }
    
    return NextResponse.json(therapist)
  } catch (error) {
    console.error("Error updating therapist:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    await dbConnect()
    
    const { id } = params
    const therapist = await User.findByIdAndDelete(id)
    
    if (!therapist) {
      return NextResponse.json({ error: "Therapist not found" }, { status: 404 })
    }
    
    return NextResponse.json({ message: "Therapist deleted successfully" })
  } catch (error) {
    console.error("Error deleting therapist:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
