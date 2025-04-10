import { NextResponse } from "next/server"

export async function POST(request) {
  try {
    const { therapistId, appointmentId, rating, comment } = await request.json()

    // Validate required fields
    if (!therapistId || !appointmentId || !rating) {
      return NextResponse.json({ error: "Therapist ID, appointment ID, and rating are required" }, { status: 400 })
    }

    // Validate rating range
    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 })
    }

    // In a real app, you would:
    // 1. Store the review in the database
    // 2. Update the therapist's average rating
    // 3. Mark the appointment as reviewed

    // Mock successful review submission
    return NextResponse.json({
      success: true,
      message: "Review submitted successfully",
    })
  } catch (error) {
    console.error("Review submission error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

