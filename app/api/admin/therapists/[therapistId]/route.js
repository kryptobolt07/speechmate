import { NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import User from "@/models/User"
import Hospital from "@/models/Hospital"

// PUT handler to update a therapist
export async function PUT(request, { params }) {
  const { therapistId } = params
  if (!therapistId) {
    return NextResponse.json({ error: "Therapist ID is required" }, { status: 400 })
  }

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
        hospitalId,
        specialty,
        phone,
        // Add other updatable fields here if needed
    } = await request.json()

    // Basic Validation
    if (!name || !email || !hospitalId || !specialty) {
        return NextResponse.json({ error: "Missing required fields: name, email, hospitalId, specialty" }, { status: 400 });
    }

    // Find the therapist to update
    const therapistToUpdate = await User.findById(therapistId);
    if (!therapistToUpdate || therapistToUpdate.role !== 'therapist') {
        return NextResponse.json({ error: "Therapist not found" }, { status: 404 });
    }

    // Check if the new email is already in use by *another* user
    const lowerCaseEmail = email.toLowerCase();
    if (lowerCaseEmail !== therapistToUpdate.email) {
        const existingUserWithEmail = await User.findOne({ email: lowerCaseEmail });
        if (existingUserWithEmail) {
            return NextResponse.json({ error: "Email already in use by another account" }, { status: 409 }); // Conflict
        }
    }

    // Check if hospital exists (optional but good practice)
    const hospitalExists = await Hospital.findById(hospitalId);
    if (!hospitalExists) {
        return NextResponse.json({ error: "Selected hospital not found" }, { status: 404 });
    }

    // Prepare update data (don't update password here)
    const updateData = {
        name,
        email: lowerCaseEmail,
        hospitalId,
        specialty,
        phone,
        // Add other fields...
    };

    const updatedTherapist = await User.findByIdAndUpdate(
        therapistId,
        { $set: updateData },
        { new: true, runValidators: true } // Return updated doc, run schema validation
    ).select("-password") // Exclude password
     .populate('hospitalId', 'name slug') // Repopulate hospital info
     .lean();

    if (!updatedTherapist) {
        return NextResponse.json({ error: "Therapist not found after update attempt" }, { status: 404 });
    }

    return NextResponse.json(
        {
            success: true,
            therapist: updatedTherapist,
            message: "Therapist updated successfully.",
        }
    );

  } catch (error) {
    console.error(`Error updating therapist ${therapistId}:`, error);
    if (error.name === "ValidationError") {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
     if (error.name === 'CastError') {
        return NextResponse.json({ error: "Invalid ID format (Therapist or Hospital)" }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE handler to remove a therapist
export async function DELETE(request, { params }) {
  const { therapistId } = params
  if (!therapistId) {
    return NextResponse.json({ error: "Therapist ID is required" }, { status: 400 })
  }

  let session = null; // Mongoose transaction session
  try {
    await dbConnect()

    // --- Start Transaction --- (Optional but recommended for multi-step operations)
    // session = await mongoose.startSession();
    // session.startTransaction();

    // Verify admin role (from middleware)
    const userPayloadHeader = request.headers.get('x-user-payload');
    if (!userPayloadHeader) return NextResponse.json({ error: "Auth payload missing" }, { status: 401 });
    let userPayload; try { userPayload = JSON.parse(userPayloadHeader); } catch (e) { return NextResponse.json({ error: "Invalid auth payload" }, { status: 400 }); }
    if (userPayload.role !== 'admin') return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });

    // Find and delete the therapist
    // Ensure we are only deleting users with the 'therapist' role for safety
    const deletedTherapist = await User.findOneAndDelete(
      { _id: therapistId, role: 'therapist' },
      // { session } // Include session if using transactions
    );

    if (!deletedTherapist) {
      // If using transactions, abort here
      // if (session) await session.abortTransaction();
      return NextResponse.json({ error: "Therapist not found or already deleted" }, { status: 404 })
    }

    // --- Patient Reassignment Logic --- 
    console.log(`Unassigning patients from deleted therapist ${therapistId}...`);
    
    // Find all patients assigned to this therapist and set their assignedTherapistId to null
    const updateResult = await User.updateMany(
        { role: 'patient', assignedTherapistId: therapistId },
        { $set: { assignedTherapistId: null } },
        // { session } // Include session if using transactions
    );

    console.log(`Patients unassigned: ${updateResult.modifiedCount}`);
    // Consider logging updateResult.matchedCount as well for debugging

    // --- Commit Transaction --- (If using transactions)
    // if (session) await session.commitTransaction();

    return NextResponse.json({ 
      success: true, 
      message: `Therapist deleted successfully. ${updateResult.modifiedCount} patient(s) were unassigned.` 
    });

  } catch (error) {
    console.error(`Error deleting therapist ${therapistId}:`, error)

    // --- Abort Transaction on Error --- (If using transactions)
    // if (session) await session.abortTransaction();

    if (error.name === 'CastError') {
        return NextResponse.json({ error: "Invalid Therapist ID format" }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  } finally {
     // --- End Session --- (If using transactions)
    // if (session) session.endSession();
  }
} 