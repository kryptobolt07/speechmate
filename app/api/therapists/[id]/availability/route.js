import { NextResponse } from "next/server"

// Mock availability data
const therapistAvailability = {
  1: {
    availableDates: ["2025-05-15", "2025-05-16", "2025-05-17", "2025-05-18", "2025-05-19"],
    availableTimeSlots: {
      "2025-05-15": ["9:00 AM", "10:00 AM", "11:00 AM", "2:00 PM", "3:00 PM"],
      "2025-05-16": ["9:00 AM", "10:00 AM", "11:00 AM", "1:00 PM", "2:00 PM"],
      "2025-05-17": ["10:00 AM", "11:00 AM", "1:00 PM"],
      "2025-05-18": ["9:00 AM", "10:00 AM", "2:00 PM", "3:00 PM"],
      "2025-05-19": ["9:00 AM", "11:00 AM", "1:00 PM", "2:00 PM", "3:00 PM"],
    },
    workingHours: {
      monday: { start: "9:00 AM", end: "5:00 PM" },
      tuesday: { start: "9:00 AM", end: "5:00 PM" },
      wednesday: { start: "9:00 AM", end: "5:00 PM" },
      thursday: { start: "9:00 AM", end: "5:00 PM" },
      friday: { start: "9:00 AM", end: "5:00 PM" },
      saturday: null,
      sunday: null,
    },
  },
  2: {
    availableDates: ["2025-05-15", "2025-05-16", "2025-05-18", "2025-05-20"],
    availableTimeSlots: {
      "2025-05-15": ["10:00 AM", "11:00 AM", "1:00 PM", "3:00 PM"],
      "2025-05-16": ["9:00 AM", "10:00 AM", "2:00 PM", "3:00 PM"],
      "2025-05-18": ["11:00 AM", "1:00 PM", "2:00 PM"],
      "2025-05-20": ["9:00 AM", "10:00 AM", "11:00 AM", "1:00 PM", "2:00 PM"],
    },
    workingHours: {
      monday: { start: "9:00 AM", end: "5:00 PM" },
      tuesday: { start: "9:00 AM", end: "5:00 PM" },
      wednesday: { start: "9:00 AM", end: "5:00 PM" },
      thursday: { start: "9:00 AM", end: "5:00 PM" },
      friday: { start: "9:00 AM", end: "5:00 PM" },
      saturday: null,
      sunday: null,
    },
  },
}

export async function GET(request, { params }) {
  try {
    const therapistId = params.id

    // Check if therapist exists
    if (!therapistAvailability[therapistId]) {
      return NextResponse.json({ error: "Therapist not found" }, { status: 404 })
    }

    // Return the therapist's availability
    return NextResponse.json(therapistAvailability[therapistId])
  } catch (error) {
    console.error("Error fetching therapist availability:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

