import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import User from "@/models/User"

export async function POST(request) {
  try {
    await dbConnect()

    const { name, email, password, phone, hospitalId } = await request.json()

    // Basic validation (Mongoose schema will also validate)
    if (!name || !email || !password || !phone || !hospitalId) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 409 } // 409 Conflict
      )
    }

    // Create new patient user
    const newUser = new User({
      name,
      email,
      password, // Password will be hashed by the pre-save hook
      phone,
      hospitalId,
      role: "patient", // Explicitly set role
    })

    await newUser.save()

    // In a real app, you might want to generate a token or send a confirmation email here

    return NextResponse.json(
      {
        success: true,
        message: "Patient registered successfully",
        userId: newUser._id, // Optionally return the new user ID
      },
      { status: 201 } // 201 Created
    )
  } catch (error) {
    console.error("Registration error:", error)
    // Handle potential Mongoose validation errors
    if (error.name === "ValidationError") {
      return NextResponse.json(
        { error: error.message },
        { status: 400 } // Bad Request
      )
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

