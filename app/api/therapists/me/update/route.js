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

    if (role !== 'therapist') {
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

    const therapist = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password')

    if (!therapist) {
      return NextResponse.json({ error: "Therapist not found" }, { status: 404 })
    }

    return NextResponse.json(therapist)
  } catch (error) {
    console.error("Error updating therapist:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
