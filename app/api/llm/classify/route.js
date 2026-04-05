import { NextResponse } from "next/server"
import { GoogleGenAI } from '@google/genai'
import dbConnect from "@/lib/dbConnect"
import User from "@/models/User"
import Hospital from "@/models/Hospital"
import Appointment from "@/models/Appointment"
import { classifySpeechAudio } from "@/lib/speech-classifier"
import { findBestTherapistForCondition } from "@/lib/condition-matcher"

export const runtime = "nodejs"

async function parseRequestPayload(request) {
  const contentType = request.headers.get("content-type") || ""

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData()
    const audioCandidate = formData.get("audio")
    const audio = audioCandidate && typeof audioCandidate.arrayBuffer === "function" && audioCandidate.size > 0
      ? audioCandidate
      : null

    return {
      description: formData.get("description")?.toString().trim() || "",
      hospital: formData.get("hospital")?.toString().trim() || "",
      appointmentDate: formData.get("appointmentDate")?.toString().trim() || "",
      appointmentTime: formData.get("appointmentTime")?.toString().trim() || "",
      audio,
    }
  }

  const payload = await request.json()
  return {
    description: payload.description?.trim() || "",
    hospital: payload.hospital?.trim() || "",
    appointmentDate: payload.appointmentDate?.trim() || "",
    appointmentTime: payload.appointmentTime?.trim() || "",
    audio: null,
  }
}

async function evaluatePatientCondition(description, audioAnalysis) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    console.warn('[LLM] GEMINI_API_KEY is not set; returning unverified classification')
    if (audioAnalysis?.primary_prediction === 'Dysarthric') return { condition: 'Dysarthric', confidence: 90, reasoning: "Local model detection" }
    return { condition: 'General Speech Therapy', confidence: 50, reasoning: "Fallback due to missing API key" }
  }

  const ai = new GoogleGenAI({ apiKey })
  const allowedConditions = [
    'Dysarthric',
    'Stuttering',
    'Articulation Disorder',
    'Voice Disorder',
    'Language Delay',
    'Aphasia Rehabilitation',
    'Swallowing Disorders (Dysphagia)',
    'General Speech Therapy',
  ]

  const model = 'gemini-2.5-flash'
  const systemInstruction = `You are an expert AI medical classifier assigning a speech therapy condition.
  
Allowed conditions: ${allowedConditions.join(', ')}

You will receive the patient's text description and an audio analysis JSON payload from a specialized PyTorch model.
Analyze both inputs carefully.
- If the audio analysis strongly predicts 'Dysarthria', select 'Dysarthric'.
- If the text description implies stuttering or the stuttering probability is high, choose 'Stuttering'.
- If audio is unavailable, rely entirely on the text description to assign the best exact matching allowed condition.

You must respond ONLY with a strict JSON object matching this schema:
{
  "condition": "The exact condition string from the allowed list",
  "confidence": <integer from 0 to 100>,
  "reasoning": "A 1-sentence brief reason why you chose this condition"
}`

  const userParts = []
  if (description) {
    userParts.push({ text: `Patient Description: ${description}` })
  }
  if (audioAnalysis) {
    userParts.push({ text: `Audio Model Analysis: ${JSON.stringify(audioAnalysis)}` })
  }

  try {
    const resp = await ai.models.generateContent({
      model,
      contents: [
        { role: 'user', parts: [{ text: systemInstruction }] },
        { role: 'user', parts: userParts },
      ],
      config: {
        responseMimeType: "application/json",
      }
    })

    let rawText = ''
    try { rawText = resp.text() } catch (e) { rawText = resp.output_text || resp.candidates?.[0]?.content?.parts?.[0]?.text || '{}' }
    rawText = rawText.replace(/```json/gi, '').replace(/```/g, '').trim()
    const data = JSON.parse(rawText)

    return {
      condition: allowedConditions.includes(data.condition) ? data.condition : 'General Speech Therapy',
      confidence: data.confidence || 50,
      reasoning: data.reasoning || "Condition evaluated based on available data."
    }
  } catch (err) {
    console.error("[LLM Evaluation] Error:", err)
    return { condition: 'General Speech Therapy', confidence: 0, reasoning: "LLM API Failure" }
  }
}

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

    const { description, hospital, appointmentDate, appointmentTime, audio } = await parseRequestPayload(request)

    if (!description && !audio) {
      return NextResponse.json({ error: "A description or audio sample is required" }, { status: 400 })
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

    let audioAnalysis = null
    if (audio) {
      audioAnalysis = await classifySpeechAudio(audio)
    }

    const evaluation = await evaluatePatientCondition(description, audioAnalysis)
    const condition = evaluation.condition

    console.info('[CLASSIFY] condition classification', {
      hospital: hospitalDoc.slug || String(hospitalDoc._id),
      appointmentDate,
      appointmentTime,
      inputChars: description?.length || 0,
      audioProvided: Boolean(audio),
      evaluation,
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

    const best = findBestTherapistForCondition(availableTherapists, condition)

    console.info('[CLASSIFY] server-selected therapist', {
      therapistId: String(best._id),
      name: best.name,
      specialty: best.specialty || 'General',
      condition,
      promptReasoning: evaluation.reasoning,
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
      classifierSource: audio ? 'Audio+Text' : 'Text',
      evaluation,
      audioAnalysis,
    })
  } catch (error) {
    console.error("Classification error:", error)
    return NextResponse.json({ error: String(error.stack || error.message || error || "Unknown Error") }, { status: 500 })
  }
}
