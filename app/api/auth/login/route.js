import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import User from "@/models/User"
import jwt from 'jsonwebtoken'

// Removed mock user database

export async function POST(request) {
  try {
    await dbConnect() // Connect to the database

    const { email, password } = await request.json()

    if (!process.env.JWT_SECRET) {
        console.error("JWT_SECRET not defined in environment variables.")
        return NextResponse.json({ error: "Internal server configuration error" }, { status: 500 })
    }

    // Find user by email and select the password field
    const user = await User.findOne({ email }).select('+password')

    // Check if user exists and password matches
    if (!user || !(await user.comparePassword(password))) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Generate JWT token
    const payload = {
        userId: user._id,
        role: user.role,
    }

    const token = jwt.sign(
        payload,
        process.env.JWT_SECRET, 
        { expiresIn: '1h' } // Token expires in 1 hour
    )

    // Return user data and token (excluding password)
    return NextResponse.json({
      token, // Send the real JWT
      role: user.role,
      userId: user._id,
      hospitalId: user.hospitalId,
      name: user.name,
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

