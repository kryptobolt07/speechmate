import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import User from "@/models/User"
import Hospital from "@/models/Hospital"

export async function POST(request) {
  try {
    await dbConnect()

    const { name, email, password, phone, hospitalId: locationSlug } = await request.json()

    // Normalize inputs
    const normalizedName = (name || "").trim()
    const normalizedEmail = (email || "").trim().toLowerCase()
    const normalizedPhone = (phone || "").trim()
    const normalizedSlug = (locationSlug || "").trim().toLowerCase()

    console.log('[patients/register] Incoming payload', {
      name: normalizedName,
      email: normalizedEmail,
      phone: normalizedPhone,
      locationSlug: normalizedSlug && `slug:${normalizedSlug}`,
    })

    // Basic validation (Mongoose schema will also validate)
    if (!normalizedName || !normalizedEmail || !password || !normalizedPhone || !normalizedSlug) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail })
    if (existingUser) {
      console.warn('[patients/register] Email already in use', { email: normalizedEmail, existingUserId: existingUser._id })
    }
    if (existingUser) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 409 } // 409 Conflict
      )
    }

    // Find the hospital by its slug (sent from frontend)
    const hospital = await Hospital.findOne({ slug: normalizedSlug })

    if (!hospital) {
      console.error('[patients/register] Hospital not found for slug', { slugTried: normalizedSlug })
      return NextResponse.json({ error: "Selected hospital location not found" }, { status: 400 })
    }

    // Create new patient user using the found hospital's ObjectId
    const newUser = new User({
      name: normalizedName,
      email: normalizedEmail,
      password, // Password will be hashed by the pre-save hook
      phone: normalizedPhone,
      hospitalId: hospital._id, // Use the actual ObjectId here
      role: "patient", // Explicitly set role
    })

    try {
      await newUser.save()
    } catch (saveError) {
      // Duplicate key safety net
      if (saveError?.code === 11000) {
        console.warn('[patients/register] Duplicate key on save', saveError?.keyValue)
        return NextResponse.json({ error: "Email already in use" }, { status: 409 })
      }
      console.error('[patients/register] Error saving new user', saveError)
      return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
    }

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
    console.error("[patients/register] Registration error:", error)
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

