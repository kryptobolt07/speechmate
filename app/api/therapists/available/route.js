import { NextResponse } from "next/server"

// Mock therapist data
const therapists = [
  {
    id: "1",
    name: "Dr. Sarah Johnson",
    specialty: "Speech-Language Pathologist",
    experience: "8 years",
    rating: 4.9,
    hospital: "Downtown Medical Center",
    hospitalId: "1",
    specializations: ["Articulation", "Fluency", "Voice"],
    image: "/placeholder.svg?height=80&width=80",
    availability: ["2025-05-15", "2025-05-16", "2025-05-17", "2025-05-18", "2025-05-19"],
  },
  {
    id: "2",
    name: "Dr. Michael Chen",
    specialty: "Speech-Language Pathologist",
    experience: "6 years",
    rating: 4.7,
    hospital: "North Valley Hospital",
    hospitalId: "2",
    specializations: ["Language", "Swallowing", "Cognitive"],
    image: "/placeholder.svg?height=80&width=80",
    availability: ["2025-05-15", "2025-05-16", "2025-05-18", "2025-05-20"],
  },
  {
    id: "3",
    name: "Dr. Lisa Rodriguez",
    specialty: "Speech-Language Pathologist",
    experience: "10 years",
    rating: 4.8,
    hospital: "East Side Clinic",
    hospitalId: "3",
    specializations: ["Pediatric", "Developmental", "Articulation"],
    image: "/placeholder.svg?height=80&width=80",
    availability: ["2025-05-17", "2025-05-18", "2025-05-19", "2025-05-21"],
  },
]

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const condition = searchParams.get("condition")
    const hospital = searchParams.get("hospital")
    const date = searchParams.get("date")

    if (!condition || !hospital) {
      return NextResponse.json({ error: "Condition and hospital are required" }, { status: 400 })
    }

    // Filter therapists based on hospital and condition
    let availableTherapists = therapists.filter(
      (therapist) =>
        therapist.hospitalId === hospital &&
        therapist.specializations.some((spec) => spec.toLowerCase().includes(condition.toLowerCase())),
    )

    // If date is provided, filter by availability
    if (date) {
      availableTherapists = availableTherapists.filter((therapist) => therapist.availability.includes(date))
    }

    return NextResponse.json(availableTherapists)
  } catch (error) {
    console.error("Error fetching available therapists:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

