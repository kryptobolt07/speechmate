import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Review from "@/models/Review"
import Appointment from "@/models/Appointment"

export async function POST(request) {
  try {
    await dbConnect()

    const userPayloadHeader = request.headers.get('x-user-payload')
    if (!userPayloadHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const user = JSON.parse(userPayloadHeader)

    const { therapistId, appointmentId, rating, comment, survey } = await request.json()

    if (!therapistId || !appointmentId || !rating) {
      return NextResponse.json({ error: "therapistId, appointmentId and rating are required" }, { status: 400 })
    }

    // Verify appointment belongs to this patient
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      patientId: user.userId,
      therapistId: therapistId,
    })
    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found or does not belong to you" }, { status: 404 })
    }

    const review = await Review.create({
      patientId: user.userId,
      therapistId,
      appointmentId,
      rating,
      comment: comment || "",
      survey: survey || {}
    })

    // Mark appointment as having feedback
    await Appointment.findByIdAndUpdate(appointmentId, {
      patientFeedback: { rating, comment: comment || "" }
    })

    return NextResponse.json({ success: true, review })
  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json({ error: "You have already reviewed this appointment" }, { status: 409 })
    }
    console.error("Review POST error:", error)
    return NextResponse.json({ error: String(error.message) }, { status: 500 })
  }
}

export async function GET(request) {
  try {
    await dbConnect()

    const userPayloadHeader = request.headers.get('x-user-payload')
    if (!userPayloadHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const user = JSON.parse(userPayloadHeader)

    let query = {}
    if (user.role === 'therapist') query.therapistId = user.userId
    else if (user.role === 'patient') query.patientId = user.userId
    // admin: no filter → see all

    const reviews = await Review.find(query)
      .populate('patientId', 'name')
      .populate('therapistId', 'name specialty')
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json(reviews)
  } catch (error) {
    console.error("Review GET error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
