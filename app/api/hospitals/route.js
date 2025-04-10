import { NextResponse } from "next/server"

// Mock hospitals data
const hospitals = [
  {
    id: "1",
    name: "Downtown Medical Center",
    address: "123 Main St, Downtown, CA 90001",
    therapists: 8,
    patients: 412,
    image: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "2",
    name: "North Valley Hospital",
    address: "456 Valley Rd, Northside, CA 90002",
    therapists: 6,
    patients: 287,
    image: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "3",
    name: "East Side Clinic",
    address: "789 East Blvd, Easttown, CA 90003",
    therapists: 5,
    patients: 203,
    image: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "4",
    name: "West End Health Center",
    address: "321 West Ave, Westville, CA 90004",
    therapists: 5,
    patients: 346,
    image: "/placeholder.svg?height=40&width=40",
  },
]

export async function GET(request) {
  try {
    // In a real app, you would:
    // 1. Verify the JWT token from the Authorization header
    // 2. Fetch hospitals from the database

    // Mock successful response
    return NextResponse.json(hospitals)
  } catch (error) {
    console.error("Error fetching hospitals:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const { name, address, city, state, zipCode, phone, description } = await request.json()

    // Validate required fields
    if (!name || !address || !city || !state || !zipCode) {
      return NextResponse.json({ error: "Name, address, city, state, and zip code are required" }, { status: 400 })
    }

    // In a real app, you would:
    // 1. Verify the JWT token and admin role
    // 2. Create the hospital in the database

    // Mock successful creation
    const newHospital = {
      id: `hospital-${Date.now()}`,
      name,
      address: `${address}, ${city}, ${state} ${zipCode}`,
      phone,
      description,
      therapists: 0,
      patients: 0,
      image: "/placeholder.svg?height=40&width=40",
    }

    // Return the new hospital
    return NextResponse.json({
      success: true,
      hospital: newHospital,
      message: "Hospital created successfully",
    })
  } catch (error) {
    console.error("Hospital creation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

