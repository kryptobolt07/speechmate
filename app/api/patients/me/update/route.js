import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import User from "@/models/User"
import bcrypt from "bcryptjs"

export async function PUT(request) {
  try {
    await dbConnect()

    // Get user payload injected by middleware
    const userPayloadHeader = request.headers.get('x-user-payload')
    if (!userPayloadHeader) {
      return NextResponse.json({ error: "Authentication data missing" }, { status: 401 })
    }

    let userPayload
    try {
      userPayload = JSON.parse(userPayloadHeader)
    } catch (e) {
      return NextResponse.json({ error: "Invalid authentication data" }, { status: 400 })
    }

    const { userId, role } = userPayload

    if (role !== 'patient') {
      return NextResponse.json({ error: "Forbidden - Insufficient role" }, { status: 403 })
    }

    const updateData = await request.json()
    
    // Hash password if provided
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 12)
    }
    
    // Remove sensitive fields
    delete updateData.role
    delete updateData._id
    delete updateData.createdAt

    const patient = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password')

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 })
    }

    return NextResponse.json(patient)
  } catch (error) {
    console.error("Error updating patient:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
