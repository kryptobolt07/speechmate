import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import User from "@/models/User"

// GET handler to fetch reassignment data (unassigned patients or available therapists)
export async function GET(request) {
  try {
    await dbConnect()

    // Verify admin role (from middleware)
    const userPayloadHeader = request.headers.get('x-user-payload');
    if (!userPayloadHeader) return NextResponse.json({ error: "Auth payload missing" }, { status: 401 });
    let userPayload; try { userPayload = JSON.parse(userPayloadHeader); } catch (e) { return NextResponse.json({ error: "Invalid auth payload" }, { status: 400 }); }
    if (userPayload.role !== 'admin') return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });

    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")

    if (type === 'patients') {
      // Fetch unassigned patients
      const patients = await User.find({
        role: 'patient',
        assignedTherapistId: null 
      })
      .select("name email _id") // Select only necessary fields
      .sort({ name: 1 })
      .lean()
      return NextResponse.json(patients)

    } else if (type === 'therapists') {
      // Fetch available therapists
      const therapists = await User.find({ role: 'therapist' })
        .select("name email _id specialty hospitalId") // Include fields useful for selection
        .populate('hospitalId', 'name') // Populate hospital name
        .sort({ name: 1 })
        .lean()
      return NextResponse.json(therapists)

    } else {
      return NextResponse.json({ error: "Invalid data type requested. Use type=patients or type=therapists." }, { status: 400 })
    }

  } catch (error) {
    console.error("Error fetching reassignment data:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 