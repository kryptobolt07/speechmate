import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import User from "@/models/User"
import Hospital from "@/models/Hospital"
import Appointment from "@/models/Appointment"

// Mock admin summary data - some parts will be replaced
const partialAdminSummary = {
  stats: {
    appointmentsToday: 42,
    completedToday: 12,
    averageRating: 4.7,
    newPatientsThisMonth: 86,
    newTherapistsThisMonth: 2,
  },
  recentAppointments: [
    {
      id: "1",
      patient: "John Doe",
      therapist: "Dr. Sarah Johnson",
      time: "10:00 AM",
      hospital: "Downtown Medical Center",
      status: "completed",
    },
    {
      id: "2",
      patient: "Emma Wilson",
      therapist: "Dr. Michael Chen",
      time: "11:30 AM",
      hospital: "North Valley Hospital",
      status: "in progress",
    },
    {
      id: "3",
      patient: "Oliver Taylor",
      therapist: "Dr. Lisa Rodriguez",
      time: "1:00 PM",
      hospital: "East Side Clinic",
      status: "upcoming",
    },
    {
      id: "4",
      patient: "Sophia Garcia",
      therapist: "Dr. James Wilson",
      time: "2:15 PM",
      hospital: "West End Health Center",
      status: "upcoming",
    },
  ],
  recentReassignments: [
    {
      patient: "William Johnson",
      fromTherapist: "Dr. Sarah Johnson",
      toTherapist: "Dr. Michael Chen",
      date: "2025-05-08",
      reason: "Therapist specialization better matches patient needs",
    },
    {
      patient: "Olivia Parker",
      fromTherapist: "Dr. James Wilson",
      toTherapist: "Dr. Lisa Rodriguez",
      date: "2025-05-06",
      reason: "Patient requested female therapist",
    },
  ],
}

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
        therapists: therapistCount,
        patients: patientCount,
      })

      totalTherapists += therapistCount
      totalPatients += patientCount
    }

    // Fetch total and pending appointments
    const totalAppointments = await Appointment.countDocuments()
    const pendingAppointments = await Appointment.countDocuments({ status: 'scheduled' })

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

    // Mock recent reassignments
    const recentReassignments = [
      { id: 1, patientName: "Olivia Martinez", fromTherapist: "Dr. James Wilson", toTherapist: "Dr. Emily Parker", date: "2024-05-19" },
      { id: 2, patientName: "Ethan Davis", fromTherapist: "Dr. Michael Chen", toTherapist: "Dr. Sarah Johnson", date: "2024-05-18" },
    ]

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

