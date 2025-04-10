import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import User from "@/models/User"
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers' // Import cookies

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
        name: user.name,
    }

    const token = jwt.sign(
        payload,
        process.env.JWT_SECRET, 
        { expiresIn: '1h' } // Token expires in 1 hour
    )

    // Create response object to set cookie
    const response = NextResponse.json({
      role: user.role,
      userId: user._id,
      name: user.name,
    })

    // Set the token in a secure HttpOnly cookie
    cookies().set('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development', // Use secure cookies in production
        sameSite: 'strict', // Prevent CSRF
        maxAge: 60 * 60, // 1 hour (matches token expiry)
        path: '/', // Cookie available for all paths
    })

    // Return user data and token (excluding password)
    return response // Return the response object with the cookie set
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

