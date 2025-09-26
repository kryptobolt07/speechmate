import { NextResponse } from "next/server"
import { GoogleGenAI } from '@google/genai'
import dbConnect from "@/lib/dbConnect"
import User from "@/models/User"
import Hospital from "@/models/Hospital"
import Appointment from "@/models/Appointment"

export async function POST(request) {
  try {
    // --- Check for user payload (any authenticated user) --- 
    const userPayloadHeader = request.headers.get('x-user-payload');
    if (!userPayloadHeader) {
      return NextResponse.json({ error: "Authentication data missing" }, { status: 401 });
    }
    try { JSON.parse(userPayloadHeader); } catch (e) {
      // Just validate JSON format, don't need the payload content itself
      return NextResponse.json({ error: "Invalid authentication data format" }, { status: 400 });
    }
    // --- End Auth Check --- 

    const { description, hospital, appointmentDate, appointmentTime } = await request.json()

    if (!description) {
      return NextResponse.json({ error: "Description is required" }, { status: 400 })
    }
    if (!hospital) {
      return NextResponse.json({ error: "Hospital is required (slug or ObjectId)" }, { status: 400 })
    }
    if (!appointmentDate || !appointmentTime) {
      return NextResponse.json({ error: "appointmentDate and appointmentTime are required" }, { status: 400 })
    }

    await dbConnect()

    // Resolve hospital id by slug or pass-through if ObjectId
    let hospitalDoc = null
    // If a 24-hex ObjectId, try by _id; otherwise assume slug
    if (typeof hospital === 'string' && hospital.match(/^[a-f\d]{24}$/i)) {
      hospitalDoc = await Hospital.findById(hospital)
    } else if (typeof hospital === 'string') {
      hospitalDoc = await Hospital.findOne({ slug: hospital.toLowerCase() })
    }
    if (!hospitalDoc) {
      return NextResponse.json({ error: "Hospital not found" }, { status: 404 })
    }

    // --- Gemini classification ---
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      console.error('GEMINI_API_KEY is not set')
      return NextResponse.json({ error: "LLM not configured" }, { status: 500 })
    }

    const ai = new GoogleGenAI({ apiKey })
    
    // Phase 1: LLM returns only a condition label
    const allowedConditions = [
      'Stuttering',
      'Articulation Disorder',
      'Voice Disorder',
      'Language Delay',
      'General Speech Therapy',
    ]

    const model = 'gemini-2.0-flash-001'
    const systemInstruction = `You are a classifier. Read the user's description of a speech issue and output exactly one label from this list: ${allowedConditions.join(', ')}. Output only the label; if uncertain, choose "General Speech Therapy".`

    const condResp = await ai.models.generateContent({
      model,
      contents: [
        { role: 'user', parts: [{ text: systemInstruction }] },
        { role: 'user', parts: [{ text: `Description: ${description}` }] },
      ],
    })

    let rawCond = ''
    try { rawCond = condResp.text?.() ?? '' } catch (e) { rawCond = (condResp.output_text || condResp?.candidates?.[0]?.content?.parts?.[0]?.text || '').toString() }
    const normalizedCond = (rawCond || '').trim()
    const condition = allowedConditions.find(c => c.toLowerCase() === normalizedCond.toLowerCase()) || 'General Speech Therapy'

    // Log LLM output (avoid dumping PII in production)
    console.info('[LLM] condition classification', {
      hospital: hospitalDoc.slug || String(hospitalDoc._id),
      appointmentDate,
      appointmentTime,
      inputChars: description?.length || 0,
      raw: rawCond,
      condition,
    })

    // Phase 2: Server selects best therapist by availability + specialty match
    const therapists = await User.find({ role: 'therapist', hospitalId: hospitalDoc._id })
      .select('_id name specialty profilePictureUrl')
      .lean()

    if (!therapists.length) {
      return NextResponse.json({ error: "No therapists found for this hospital" }, { status: 404 })
    }

    const busyAppointments = await Appointment.find({
      hospitalId: hospitalDoc._id,
      appointmentDate: new Date(appointmentDate),
      appointmentTime,
      status: { $in: ['pending', 'confirmed', 'completed'] },
    }).select('therapistId').lean()

    const busyTherapistIds = new Set(busyAppointments.map(a => String(a.therapistId)))
    const availableTherapists = therapists.filter(t => !busyTherapistIds.has(String(t._id)))

    if (!availableTherapists.length) {
      return NextResponse.json({ error: "No therapists available at the requested time" }, { status: 409 })
    }

    const best = availableTherapists.find(t => (t.specialty || '').toLowerCase().includes(condition.toLowerCase())) || availableTherapists[0]

    console.info('[LLM] server-selected therapist', {
      therapistId: String(best._id),
      name: best.name,
      specialty: best.specialty || 'General',
      condition,
      availableCount: availableTherapists.length,
    })

    return NextResponse.json({
      therapistId: String(best._id),
      therapist: {
        _id: best._id,
        name: best.name,
        specialty: best.specialty || 'General',
        profilePictureUrl: best.profilePictureUrl || null,
      },
      condition,
    })
  } catch (error) {
    console.error("Classification error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

