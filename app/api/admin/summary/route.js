import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import User from "@/models/User"
import Hospital from "@/models/Hospital"

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

    // Construct the final summary object
    const finalSummary = {
      stats: {
        ...partialAdminSummary.stats,
        totalTherapists: totalTherapists,
        activePatients: totalPatients,
      },
      recentAppointments: partialAdminSummary.recentAppointments,
      hospitals: hospitalStats,
      recentReassignments: partialAdminSummary.recentReassignments,
    }

    // Mock successful response
    return NextResponse.json(finalSummary)
  } catch (error) {
    console.error("Error fetching admin summary:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

