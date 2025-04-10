import { NextResponse } from "next/server"

// Mock admin summary data
const adminSummary = {
  stats: {
    totalTherapists: 24,
    activePatients: 1248,
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
  hospitals: [
    { name: "Downtown Medical Center", therapists: 8, patients: 412 },
    { name: "North Valley Hospital", therapists: 6, patients: 287 },
    { name: "East Side Clinic", therapists: 5, patients: 203 },
    { name: "West End Health Center", therapists: 5, patients: 346 },
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
    // In a real app, you would:
    // 1. Verify the JWT token from the Authorization header
    // 2. Verify the user has admin role
    // 3. Fetch the summary data from the database

    // Mock successful response
    return NextResponse.json(adminSummary)
  } catch (error) {
    console.error("Error fetching admin summary:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

