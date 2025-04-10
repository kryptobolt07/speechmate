import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import User from "@/models/User"
import Hospital from "@/models/Hospital"

export async function POST(request) {
  try {
    await dbConnect()

    const { name, email, password, phone, hospitalId: locationSlug } = await request.json()

    // Basic validation (Mongoose schema will also validate)
    if (!name || !email || !password || !phone || !locationSlug) {
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

    // Find the hospital by its slug (sent from frontend)
    const hospital = await Hospital.findOne({ slug: locationSlug.toLowerCase() })

    if (!hospital) {
      console.error(`Hospital not found for slug: ${locationSlug}`)
      return NextResponse.json({ error: "Selected hospital location not found" }, { status: 400 })
    }

    // Create new patient user using the found hospital's ObjectId
    const newUser = new User({
      name,
      email,
      password, // Password will be hashed by the pre-save hook
      phone,
      hospitalId: hospital._id, // Use the actual ObjectId here
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

