import { NextResponse } from "next/server"

// Mock therapist schedule data
const therapistSchedule = {
  today: [
    {
      id: "1",
      patient: "John Doe",
      time: "10:00 AM",
      duration: "45 min",
      condition: "Articulation Disorder",
      status: "upcoming",
    },
    {
      id: "2",
      patient: "Emma Wilson",
      time: "11:30 AM",
      duration: "30 min",
      condition: "Stuttering",
      status: "upcoming",
    },
    {
      id: "3",
      patient: "Michael Brown",
      time: "2:00 PM",
      duration: "45 min",
      condition: "Voice Disorder",
      status: "upcoming",
    },
    {
      id: "4",
      patient: "Sophia Garcia",
      time: "3:15 PM",
      duration: "30 min",
      condition: "Language Delay",
      status: "upcoming",
    },
  ],
  week: [
    {
      id: "5",
      patient: "Oliver Taylor",
      date: "Tomorrow",
      time: "9:30 AM",
      condition: "Aphasia",
      status: "upcoming",
    },
    {
      id: "6",
      patient: "Ava Martinez",
      date: "2025-05-12",
      time: "1:00 PM",
      condition: "Dysarthria",
      status: "upcoming",
    },
    {
      id: "7",
      patient: "William Johnson",
      date: "2025-05-13",
      time: "11:00 AM",
      condition: "Apraxia",
      status: "upcoming",
    },
  ],
  patients: [
    {
      id: "1",
      name: "John Doe",
      condition: "Articulation Disorder",
      nextAppointment: "2025-05-10 10:00 AM",
      progress: "Improving",
    },
    {
      id: "2",
      name: "Emma Wilson",
      condition: "Stuttering",
      nextAppointment: "2025-05-10 11:30 AM",
      progress: "Stable",
    },
    {
      id: "3",
      name: "Michael Brown",
      condition: "Voice Disorder",
      nextAppointment: "2025-05-10 2:00 PM",
      progress: "Improving",
    },
    {
      id: "4",
      name: "Sophia Garcia",
      condition: "Language Delay",
      nextAppointment: "2025-05-10 3:15 PM",
      progress: "Needs attention",
    },
    {
      id: "5",
      name: "Oliver Taylor",
      condition: "Aphasia",
      nextAppointment: "2025-05-11 9:30 AM",
      progress: "New patient",
    },
  ],
}

export async function GET(request) {
  try {
    // In a real app, you would:
    // 1. Verify the JWT token from the Authorization header
    // 2. Extract the therapist ID from the token
    // 3. Fetch the therapist's schedule from the database

    // Mock successful response
    return NextResponse.json(therapistSchedule)
  } catch (error) {
    console.error("Error fetching therapist schedule:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

