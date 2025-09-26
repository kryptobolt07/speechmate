import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Hospital from "@/models/Hospital"

export async function GET(request, { params }) {
  try {
    await dbConnect()
    
    const { id } = params
    const hospital = await Hospital.findById(id)
    
    if (!hospital) {
      return NextResponse.json({ error: "Hospital not found" }, { status: 404 })
    }
    
    return NextResponse.json(hospital)
  } catch (error) {
    console.error("Error fetching hospital:", error)
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
    
    const hospital = await Hospital.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
    
    if (!hospital) {
      return NextResponse.json({ error: "Hospital not found" }, { status: 404 })
    }
    
    return NextResponse.json(hospital)
  } catch (error) {
    console.error("Error updating hospital:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    await dbConnect()
    
    const { id } = params
    const hospital = await Hospital.findByIdAndDelete(id)
    
    if (!hospital) {
      return NextResponse.json({ error: "Hospital not found" }, { status: 404 })
    }
    
    return NextResponse.json({ message: "Hospital deleted successfully" })
  } catch (error) {
    console.error("Error deleting hospital:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
