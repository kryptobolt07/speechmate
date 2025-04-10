import { NextResponse } from "next/server"

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

    const { description } = await request.json()

    if (!description) {
      return NextResponse.json({ error: "Description is required" }, { status: 400 })
    }

    // In a real app, you would:
    // 1. Call an LLM API (like OpenAI) to classify the condition
    // 2. Process the response to extract the condition

    // Mock classification based on keywords in the description
    let condition = "General Speech Therapy"

    if (description.toLowerCase().includes("stutter")) {
      condition = "Stuttering"
    } else if (description.toLowerCase().includes("pronounce") || description.toLowerCase().includes("articulation")) {
      condition = "Articulation Disorder"
    } else if (description.toLowerCase().includes("voice") || description.toLowerCase().includes("vocal")) {
      condition = "Voice Disorder"
    } else if (description.toLowerCase().includes("language") || description.toLowerCase().includes("vocabulary")) {
      condition = "Language Delay"
    }

    // Return the classified condition
    return NextResponse.json({ condition })
  } catch (error) {
    console.error("Classification error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

