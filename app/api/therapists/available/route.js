import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import User from "@/models/User"
import Hospital from "@/models/Hospital"

// Mock therapist data
// const therapists = [ ... ]; // Removed mock data

export async function GET(request) {
  try {
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const condition = searchParams.get("condition")
    const hospitalSlug = searchParams.get("hospital")
    // const date = searchParams.get("date") // Removed date filtering for now

    // Validate required query parameters
    if (!condition || !hospitalSlug) {
      return NextResponse.json({ error: "Condition and hospital slug are required" }, { status: 400 })
    }

    // Find the hospital by slug to get its ID
    const hospital = await Hospital.findOne({ slug: hospitalSlug.toLowerCase() })
    if (!hospital) {
      // Use a 404 status code if the hospital isn't found
      return NextResponse.json({ error: `Hospital not found for slug: ${hospitalSlug}` }, { status: 404 })
    }

    // Construct the query for therapists
    const query = {
      role: 'therapist',
      hospitalId: hospital._id,
      // Use case-insensitive regex to match condition against specialty
      specialty: { $regex: condition, $options: 'i' }
    }

    // Fetch therapists matching the criteria
    // Select fields to return - adjust as needed
    const availableTherapists = await User.find(query).select('name specialty profilePictureUrl _id')

    // Filter therapists based on hospital and condition
    // let availableTherapists = therapists.filter( ... ); // Removed filtering logic for mock data

    // If date is provided, filter by availability
    // if (date) { ... } // Removed filtering logic for mock data

    return NextResponse.json(availableTherapists)
  } catch (error) {
    console.error("Error fetching available therapists:", error)
    // Handle potential Mongoose CastError if hospitalId format is wrong (though unlikely here)
    if (error.name === 'CastError') {
        return NextResponse.json({ error: "Invalid data format in query" }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

