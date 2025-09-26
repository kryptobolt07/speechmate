import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import User from "@/models/User"
import Hospital from "@/models/Hospital"
import Appointment from "@/models/Appointment"

// Removed mock hospital names to avoid placeholders

export async function GET(request) {
  try {
    await dbConnect()

    // Verify admin role (from middleware) - Assuming middleware adds this
    const userPayloadHeader = request.headers.get('x-user-payload');
    if (!userPayloadHeader) return NextResponse.json({ error: "Auth payload missing" }, { status: 401 });
    let userPayload; try { userPayload = JSON.parse(userPayloadHeader); } catch (e) { return NextResponse.json({ error: "Invalid auth payload" }, { status: 400 }); }
    if (userPayload.role !== 'admin') return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });

    // Fetch all hospitals
    const hospitals = await Hospital.find().lean()

    let totalTherapists = 0
    let totalPatients = 0
    const hospitalStats = []

    // Calculate counts for each hospital
    for (const hospital of hospitals) {
      const therapistCount = await User.countDocuments({ role: 'therapist', hospitalId: hospital._id })
      const patientCount = await User.countDocuments({ role: 'patient', hospitalId: hospital._id })

      hospitalStats.push({
        name: hospital.name,
        therapistCount: therapistCount,
        patientCount: patientCount,
      })

      totalTherapists += therapistCount
      totalPatients += patientCount
    }

    // Fetch total and pending appointments
    const totalAppointments = await Appointment.countDocuments()
    const pendingAppointments = await Appointment.countDocuments({ status: 'pending' })

    // Construct the stats array
    const stats = [
      { name: "Total Therapists", value: totalTherapists, icon: "Users" },
      { name: "Total Patients", value: totalPatients, icon: "Users" },
      { name: "Total Appointments", value: totalAppointments, icon: "CalendarCheck" },
      { name: "Pending Appointments", value: pendingAppointments, icon: "CalendarClock" },
    ]

    // Fetch recent appointments
    const recentAppointments = await Appointment.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('patientId', 'name')
      .populate('therapistId', 'name')
      .select('patientId therapistId appointmentDate appointmentTime status createdAt')
      .lean()

    // Format recent appointments for frontend
    const formattedRecentAppointments = recentAppointments.map(appt => ({
      id: appt._id,
      patientName: appt.patientId?.name || 'N/A',
      therapistName: appt.therapistId?.name || 'N/A',
      dateTime: `${new Date(appt.appointmentDate).toLocaleDateString()} ${appt.appointmentTime}`,
      status: appt.status,
      bookedAt: appt.createdAt
    }))

    // TODO: Implement real reassignment tracking
    // For now, return empty array until we have a reassignment log system
    const recentReassignments = []

    // Construct the final summary object
    const finalSummary = {
      stats,
      hospitals: hospitalStats,
      recentAppointments: formattedRecentAppointments,
      recentReassignments,
    }

    // Mock successful response
    return NextResponse.json(finalSummary)
  } catch (error) {
    console.error("Error fetching admin summary:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

