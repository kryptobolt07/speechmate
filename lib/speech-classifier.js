export async function classifySpeechAudio(file) {
  // Try to use environment variable, default to the user's HuggingFace space
  const hfUrl = process.env.HF_SPACE_URL || "https://kryptobolt-speechmate.hf.space"
  const classifyEndpoint = `${hfUrl}/api/classify`

  const formData = new FormData()
  // Append audio file precisely as FastAPI UploadFile expects
  formData.append("audio", file)

  try {
    const response = await fetch(classifyEndpoint, {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      let msg = "Fallback audio classification error"
      try {
        const errJson = await response.json()
        msg = errJson.error || msg
      } catch { }
      throw new Error(msg)
    }

    return await response.json()
  } catch (error) {
    throw new Error(`Unable to reach HuggingFace classification backend. ${error.message}`)
  }
}
