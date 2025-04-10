import { NextResponse } from "next/server"

export async function PATCH(request, { params }) {
  try {
    const patientId = params.id
    const { therapistId, reason } = await request.json()

    // Validate required fields
    if (!therapistId || !reason) {
      return NextResponse.json({ error: "Therapist ID and reason are required" }, { status: 400 })
    }

    // In a real app, you would:
    // 1. Verify the JWT token and admin role
    // 2. Update the patient's assigned therapist in the database
    // 3. Log the reassignment with the reason
    // 4. Notify both the patient and therapists

    // Mock successful reassignment
    return NextResponse.json({
      success: true,
      message: "Therapist reassigned successfully",
    })
  } catch (error) {
    console.error("Therapist reassignment error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

