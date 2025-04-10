import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import Hospital from "@/models/Hospital"
import User from "@/models/User"
import mongoose from 'mongoose'; // Needed for ObjectId check

// Helper function to generate slug (optional, if not provided by client)
// function generateSlug(name) {
//   return name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
// }

export async function GET(request) {
  try {
    await dbConnect()

    // Optional: Verify admin role if only admins can list detailed counts
    // const userPayload = JSON.parse(request.headers.get('x-user-payload') || '{}');
    // if (userPayload.role !== 'admin') {
    //   return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    // }

    // Aggregation pipeline to fetch hospitals and count users
    const hospitalsWithCounts = await Hospital.aggregate([
      {
        $lookup: {
          from: "users", // The actual name of the users collection in MongoDB
          localField: "_id",
          foreignField: "hospitalId",
          as: "assignedUsers",
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          slug: 1,
          // Add other Hospital fields you want to return
          therapists: {
            $size: {
              $filter: {
                input: "$assignedUsers",
                as: "user",
                cond: { $eq: ["$$user.role", "therapist"] },
              },
            },
          },
          patients: {
            $size: {
              $filter: {
                input: "$assignedUsers",
                as: "user",
                cond: { $eq: ["$$user.role", "patient"] },
              },
            },
          },
          // address: 1, // Include if needed by the frontend card
          // phone: 1,
          // description: 1,
        },
      },
      {
         $sort: { name: 1 } // Sort alphabetically by name
      }
    ])

    return NextResponse.json(hospitalsWithCounts)
  } catch (error) {
    console.error("Error fetching hospitals with counts:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    await dbConnect()

    // Verify admin role
    const userPayloadHeader = request.headers.get('x-user-payload');
    if (!userPayloadHeader) {
        return NextResponse.json({ error: "Authentication data missing" }, { status: 401 });
    }
    let userPayload;
    try { userPayload = JSON.parse(userPayloadHeader); } catch (e) {
        return NextResponse.json({ error: "Invalid authentication data format" }, { status: 400 });
    }
    if (userPayload.role !== 'admin') {
        return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    // Assume client sends name and a desired slug
    const { name, slug, address, city, state, zipCode, phone, description } = await request.json()

    // Validate required fields
    if (!name || !slug ) { // Removed other address fields as required for now, add back if needed
      return NextResponse.json({ error: "Name and Slug are required" }, { status: 400 })
    }

    const processedSlug = slug.toLowerCase().trim();

    // Check if hospital with the same slug already exists
    const existingHospital = await Hospital.findOne({ slug: processedSlug })
    if (existingHospital) {
      return NextResponse.json(
        { error: `Hospital with slug '${processedSlug}' already exists` },
        { status: 409 } // Conflict
      )
    }

    // Create new hospital
    const newHospital = new Hospital({
      name,
      slug: processedSlug,
      // Add other fields as needed
      // address, city, state, zipCode, phone, description 
    })

    const savedHospital = await newHospital.save()

    return NextResponse.json(
      {
        success: true,
        hospital: savedHospital,
        message: "Hospital created successfully",
      },
      { status: 201 } // Created
    )
  } catch (error) {
    console.error("Hospital creation error:", error)
     if (error.name === "ValidationError") {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

