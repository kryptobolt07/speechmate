import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import User from "@/models/User"
import Appointment from "@/models/Appointment"

// Mock therapist schedule data
// const therapistSchedule = { ... };

export async function GET(request) {
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
      return NextResponse.json({ error: "Invalid authentication data format" }, { status: 400 })
    }

    const { userId, role } = userPayload

    if (!userId || role !== 'therapist') {
      return NextResponse.json({ error: "Unauthorized or Invalid Role" }, { status: 403 })
    }

    // Fetch the therapist's own data
    const therapist = await User.findById(userId).select("-password").lean()

    if (!therapist) {
      return NextResponse.json({ error: "Therapist not found" }, { status: 404 })
    }

    // Fetch today's appointments
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const endOfToday = new Date(today)
    endOfToday.setHours(23, 59, 59, 999)

    const todayAppointments = await Appointment.find({
      therapistId: userId,
      appointmentDate: { $gte: today, $lte: endOfToday },
      status: { $in: ['pending', 'confirmed'] }
    })
    .populate('patientId', 'name')
    .sort({ appointmentTime: 1 })
    .lean()

    // Fetch this week's appointments
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay()) // Start of current week (Sunday)
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6) // End of current week (Saturday)
    endOfWeek.setHours(23, 59, 59, 999)

    const weekAppointments = await Appointment.find({
      therapistId: userId,
      appointmentDate: { $gte: startOfWeek, $lte: endOfWeek },
      status: { $in: ['pending', 'confirmed'] }
    })
    .populate('patientId', 'name')
    .sort({ appointmentDate: 1, appointmentTime: 1 })
    .lean()

    // Fetch assigned patients
    const patients = await User.find({ 
      assignedTherapistId: userId,
      role: 'patient'
    })
    .select('name email phone')
    .lean()

    // Format appointments for frontend
    const formatAppointments = (appointments) => appointments.map(apt => ({
      id: apt._id,
      patient: apt.patientId?.name || 'Unknown',
      condition: apt.condition || 'General',
      time: apt.appointmentTime,
      date: new Date(apt.appointmentDate).toLocaleDateString(),
      duration: `${apt.duration || 45} min`,
      status: apt.status,
      type: apt.type
    }))

    const scheduleResponse = {
      therapist: therapist,
      today: formatAppointments(todayAppointments),
      week: formatAppointments(weekAppointments),
      patients: patients
    }

    return NextResponse.json(scheduleResponse)
  } catch (error) {
    console.error("Error fetching therapist schedule:", error)
    if (error.name === 'CastError') {
        return NextResponse.json({ error: "Invalid user ID format" }, { status: 400 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

