const CONDITION_SPECIALTY_ALIASES = {
  Dysarthric: ["dysarth", "general speech therapy"],
  Stuttering: ["stuttering"],
  "Articulation Disorder": ["articulation disorder"],
  "Voice Disorder": ["voice disorder"],
  "Language Delay": ["language delay"],
  "General Speech Therapy": ["general speech therapy"],
}

export function findBestTherapistForCondition(therapists, condition) {
  if (!Array.isArray(therapists) || therapists.length === 0) {
    return null
  }

  const aliases = CONDITION_SPECIALTY_ALIASES[condition] || [condition]
  const loweredAliases = aliases.map((alias) => alias.toLowerCase())

  const matched = therapists.find((therapist) => {
    const specialty = (therapist.specialty || "").toLowerCase()
    return loweredAliases.some((alias) => specialty.includes(alias))
  })

  if (matched) {
    return matched
  }

  return (
    therapists.find((therapist) =>
      (therapist.specialty || "").toLowerCase().includes("general speech therapy"),
    ) || therapists[0]
  )
}
