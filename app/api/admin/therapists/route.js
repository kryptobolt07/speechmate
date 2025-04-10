import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import User from "@/models/User"
import Hospital from "@/models/Hospital" // Needed for populating hospital details

// GET handler to fetch therapists
export async function GET(request) {
  try {
    await dbConnect()

    // Verify admin role (from middleware)
    const userPayloadHeader = request.headers.get('x-user-payload');
    if (!userPayloadHeader) return NextResponse.json({ error: "Auth payload missing" }, { status: 401 });
    let userPayload; try { userPayload = JSON.parse(userPayloadHeader); } catch (e) { return NextResponse.json({ error: "Invalid auth payload" }, { status: 400 }); }
    if (userPayload.role !== 'admin') return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });

    const { searchParams } = new URL(request.url)
    const searchQuery = searchParams.get("search")

    // Base query to find therapists
    const query = { role: 'therapist' }

    // Add search criteria if provided
    if (searchQuery) {
      query.$or = [
        { name: { $regex: searchQuery, $options: 'i' } }, // Case-insensitive search on name
        { email: { $regex: searchQuery, $options: 'i' } }, // Case-insensitive search on email
        // Add search by specialty if needed
        // { specialty: { $regex: searchQuery, $options: 'i' } }
      ]
    }

    // Fetch therapists, select fields, populate hospital info, sort by name
    const therapists = await User.find(query)
      .select("-password") // Exclude password
      .populate('hospitalId', 'name slug') // Populate name and slug from the referenced Hospital
      .sort({ name: 1 })
      .lean() // Return plain JS objects

    // TODO: Add aggregation for patient counts if needed

    return NextResponse.json(therapists)

  } catch (error) {
    console.error("Error fetching therapists:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST handler to create a new therapist
export async function POST(request) {
  try {
    await dbConnect()

     // Verify admin role (from middleware)
    const userPayloadHeader = request.headers.get('x-user-payload');
    if (!userPayloadHeader) return NextResponse.json({ error: "Auth payload missing" }, { status: 401 });
    let userPayload; try { userPayload = JSON.parse(userPayloadHeader); } catch (e) { return NextResponse.json({ error: "Invalid auth payload" }, { status: 400 }); }
    if (userPayload.role !== 'admin') return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });

    const {
        name,
        email,
        hospitalId, // Expecting the ObjectId of the hospital
        specialty,
        phone,
        // Add other fields from the frontend form if needed (e.g., schedule, profilePictureUrl)
    } = await request.json()

    // Basic Validation
    if (!name || !email || !hospitalId || !specialty) {
        return NextResponse.json({ error: "Missing required fields: name, email, hospitalId, specialty" }, { status: 400 });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
        return NextResponse.json({ error: "Email already in use" }, { status: 409 }); // Conflict
    }

    // Check if hospital exists (optional but good practice)
    const hospitalExists = await Hospital.findById(hospitalId);
    if (!hospitalExists) {
        return NextResponse.json({ error: "Selected hospital not found" }, { status: 404 });
    }

    // Set a default temporary password (user should change this)
    // In a real app, consider an invitation flow instead
    const temporaryPassword = "password123"; // TODO: Use a more secure default or generation strategy

    const newUser = new User({
        name,
        email: email.toLowerCase(),
        password: temporaryPassword, // Will be hashed by pre-save hook
        phone,
        role: 'therapist',
        hospitalId, // Should be a valid ObjectId
        specialty,
        // profilePictureUrl: profilePictureUrl || defaultUrl,
        // Add schedule processing if needed
    });

    const savedUser = await newUser.save();

    // Exclude password from the returned object
    const therapistToReturn = savedUser.toObject();
    delete therapistToReturn.password;

    return NextResponse.json(
        {
            success: true,
            therapist: therapistToReturn,
            message: "Therapist created successfully with temporary password.",
        },
        { status: 201 } // Created
    );

  } catch (error) {
    console.error("Error creating therapist:", error);
    if (error.name === "ValidationError") {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
     if (error.name === 'CastError') { // Handle invalid ObjectId format for hospitalId
        return NextResponse.json({ error: "Invalid hospital ID format" }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 