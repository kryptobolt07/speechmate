"use client"

import { useEffect, useRef, useState } from "react"
import { UnifiedSidebar, HamburgerButton } from "@/components/unified-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { format } from "date-fns"
import { CalendarIcon, FileAudio, Loader2, Sparkles, Upload } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"



export default function BookAppointment() {
  const [step, setStep] = useState(1)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [formData, setFormData] = useState({
    hospital: "",
    issueDescription: "",
    date: undefined,
  })
  const [classifiedCondition, setClassifiedCondition] = useState(null)
  const [classifierSource, setClassifierSource] = useState(null)
  const [audioAnalysis, setAudioAnalysis] = useState(null)
  const [evaluationReasoning, setEvaluationReasoning] = useState(null)
  const [hospitals, setHospitals] = useState([])
  const [availableTherapists, setAvailableTherapists] = useState([])
  const [selectedTherapistId, setSelectedTherapistId] = useState(null)
  const [selectedTime, setSelectedTime] = useState("")
  const [isLoadingCondition, setIsLoadingCondition] = useState(false)
  const [isLoadingTherapists, setIsLoadingTherapists] = useState(false)
  const [isLoadingBooking, setIsLoadingBooking] = useState(false)
  const [audioFile, setAudioFile] = useState(null)
  const [audioPreviewUrl, setAudioPreviewUrl] = useState("")
  const router = useRouter()
  const { toast } = useToast()


  useEffect(() => {
    const loadHospitals = async () => {
      try {
        const res = await fetch("/api/hospitals")
        if (!res.ok) throw new Error("Failed to fetch hospitals")
        const data = await res.json()
        setHospitals(Array.isArray(data) ? data : [])
      } catch (e) {
        console.error("Hospitals load error", e)
      }
    }

    loadHospitals()
  }, [])

  useEffect(() => {
    return () => {
      if (audioPreviewUrl) {
        URL.revokeObjectURL(audioPreviewUrl)
      }
    }
  }, [audioPreviewUrl])

  const resetAudioPreview = () => {
    if (audioPreviewUrl) {
      URL.revokeObjectURL(audioPreviewUrl)
    }
  }

  const setSelectedAudioFile = (file) => {
    if (audioPreviewUrl) {
      URL.revokeObjectURL(audioPreviewUrl)
    }

    const nextUrl = file ? URL.createObjectURL(file) : ""

    setAudioFile(file)
    setAudioPreviewUrl(nextUrl)
  }

  const handleChange = (field, value) => {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const handleAudioUpload = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    setSelectedAudioFile(file)
  }

  const handleNext = async () => {
    if (step === 1) {
      if (!formData.hospital || (!formData.issueDescription && !audioFile)) {
        toast({
          variant: "destructive",
          title: "Missing information",
          description: "Please select a location and provide either a description or upload an audio sample.",
        })
        return
      }
      setStep(2)
      return
    }

    if (step === 2) {
      if (!formData.date || !selectedTime) {
        toast({
          variant: "destructive",
          title: "Missing information",
          description: "Please select a preferred date and enter a time.",
        })
        return
      }

      setIsLoadingCondition(true)
      setIsLoadingTherapists(true)
      setStep(3)

      try {
        const formattedDate = format(formData.date, "yyyy-MM-dd")
        const payload = new FormData()
        payload.append("description", formData.issueDescription)
        payload.append("hospital", formData.hospital)
        payload.append("appointmentDate", formattedDate)
        payload.append("appointmentTime", selectedTime)
        payload.append("audio", audioFile)

        const classifyResponse = await fetch("/api/llm/classify", {
          method: "POST",
          body: payload,
        })

        if (!classifyResponse.ok) {
          let message = "Failed to classify condition"
          try {
            const text = await classifyResponse.text()
            try {
              message = JSON.parse(text).error || message
            } catch {
              message = text || message
            }
          } catch { }
          throw new Error(message)
        }

        const classifyData = await classifyResponse.json()
        const { therapistId, therapist, condition, classifierSource: source, audioAnalysis: analysis, evaluation } = classifyData

        setAvailableTherapists(therapist ? [therapist] : [])
        if (therapistId) setSelectedTherapistId(therapistId)
        setClassifiedCondition(condition || null)
        setClassifierSource(source || null)
        setAudioAnalysis(analysis || null)
        setEvaluationReasoning(evaluation?.reasoning || null)
      } catch (error) {
        console.error("Error during step 2->3 transition:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Could not find therapists. Please try again.",
        })
        setStep(2)
      } finally {
        setIsLoadingCondition(false)
        setIsLoadingTherapists(false)
      }
    }
  }

  const handleBack = () => {
    if (step === 3) {
      setAvailableTherapists([])
      setClassifiedCondition(null)
      setClassifierSource(null)
      setAudioAnalysis(null)
      setEvaluationReasoning(null)
      setSelectedTherapistId(null)
    }

    if (step > 1) {
      setStep((current) => current - 1)
    }
  }

  const handleConfirm = async () => {
    if (!selectedTherapistId || !selectedTime) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please select a therapist and enter a preferred time.",
      })
      return
    }

    setIsLoadingBooking(true)
    try {
      const payload = {
        therapistId: selectedTherapistId,
        appointmentDate: format(formData.date, "yyyy-MM-dd"),
        appointmentTime: selectedTime,
        type: "Initial Assessment",
        condition: classifiedCondition,
        classification: {
          source: classifierSource,
          primaryPrediction: audioAnalysis?.primary_prediction || null,
          selectedCondition: classifiedCondition,
          geminiReasoning: evaluationReasoning,
          probabilities: audioAnalysis?.combined_probabilities || null,
        },
        notes: formData.issueDescription,
      }

      const response = await fetch("/api/appointments/book", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        let message = "Booking failed. Please try again."
        try {
          const text = await response.text()
          try {
            message = JSON.parse(text).error || message
          } catch {
            message = text || message
          }
        } catch { }
        throw new Error(message)
      }

      const result = await response.json()
      toast({
        title: "Appointment Booked",
        description: result.message || "Your appointment has been successfully scheduled.",
      })
      router.push("/patient/dashboard")
    } catch (error) {
      console.error("Booking confirmation error:", error)
      toast({ variant: "destructive", title: "Booking Error", description: error.message })
    } finally {
      setIsLoadingBooking(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UnifiedSidebar userType="patient" isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <div className="flex flex-col">
        <header className="sticky top-0 z-10 border-b bg-white shadow-sm">
          <div className="flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-4">
              <HamburgerButton onClick={() => setIsSidebarOpen(true)} />
              <h2 className="text-lg font-bold">Book Appointment</h2>
            </div>
          </div>
        </header>

        <main className="mx-auto flex-1 w-full max-w-4xl p-6">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Book New Appointment</h1>
            <p className="mt-1 text-gray-600">
              Share your concern, add a short speech sample, and we&apos;ll route you to the right therapist.
            </p>
          </div>

          <div className="mb-8">
            <div className="mb-8 flex justify-between">
              <div className={`h-2 w-1/3 rounded-l-full ${step >= 1 ? "bg-teal-500" : "bg-gray-200"}`} />
              <div className={`h-2 w-1/3 ${step >= 2 ? "bg-teal-500" : "bg-gray-200"}`} />
              <div className={`h-2 w-1/3 rounded-r-full ${step >= 3 ? "bg-teal-500" : "bg-gray-200"}`} />
            </div>
          </div>

          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Step 1: Tell us about your needs</CardTitle>
                <CardDescription>
                  Pick a location, describe the issue, and provide a short audio sample for screening.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="hospital">Preferred Hospital/Location</Label>
                  <Select onValueChange={(value) => handleChange("hospital", value)} value={formData.hospital}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      {hospitals.map((hospital) => (
                        <SelectItem key={hospital._id} value={hospital.slug}>
                          {hospital.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="issueDescription">Describe your speech or language issue</Label>
                  <Textarea
                    id="issueDescription"
                    placeholder="Please describe symptoms, patterns you notice, or what you'd like help with..."
                    rows={5}
                    value={formData.issueDescription}
                    onChange={(event) => handleChange("issueDescription", event.target.value)}
                  />
                </div>

                <div className="rounded-2xl border border-teal-100 bg-gradient-to-br from-teal-50 via-white to-amber-50 p-5">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-teal-600" />
                        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">Audio Intake</p>
                      </div>
                      <h3 className="mt-2 text-lg font-semibold text-gray-900">Record or upload a voice sample</h3>
                      <p className="mt-1 max-w-2xl text-sm text-gray-600">
                        We analyze a short sample with the trained Torgo model before matching you to a therapist.
                      </p>
                    </div>
                    <Badge variant="secondary" className="w-fit bg-white text-teal-700">
                      3 second model window
                    </Badge>
                  </div>

                  <div className="mt-5 grid gap-3 md:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => setAudioMode("record")}
                      className={cn(
                        "rounded-2xl border p-4 text-left transition",
                        audioMode === "record"
                          ? "border-teal-500 bg-white shadow-sm"
                          : "border-teal-100 bg-white/70 hover:border-teal-300",
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className="rounded-full bg-teal-100 p-2 text-teal-700">
                          <Mic className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Use microphone</p>
                          <p className="text-sm text-gray-500">Capture a fresh sample in-browser</p>
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAudioMode("upload")}
                      className={cn(
                        "rounded-2xl border p-4 text-left transition",
                        audioMode === "upload"
                          ? "border-amber-500 bg-white shadow-sm"
                          : "border-amber-100 bg-white/70 hover:border-amber-300",
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className="rounded-full bg-amber-100 p-2 text-amber-700">
                          <Upload className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Upload recording</p>
                          <p className="text-sm text-gray-500">Use a WAV, MP3, M4A, or similar file</p>
                        </div>
                      </div>
                    </button>
                  </div>

                  {audioMode === "record" ? (
                    <div className="mt-5 rounded-2xl border border-dashed border-teal-300 bg-white p-5">
                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">Microphone capture</p>
                          <p className="text-sm text-gray-500">
                            Record a clean sentence or short speech sample. We recommend 5 to 10 seconds.
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
                            {recordingSeconds}s
                          </div>
                          {isRecording ? (
                            <Button type="button" variant="destructive" onClick={() => void stopRecording()}>
                              <Square className="mr-2 h-4 w-4" />
                              Stop
                            </Button>
                          ) : (
                            <Button type="button" onClick={() => void startRecording()} className="bg-teal-600 hover:bg-teal-700">
                              <Mic className="mr-2 h-4 w-4" />
                              Start Recording
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-5 rounded-2xl border border-dashed border-amber-300 bg-white p-5">
                      <Label htmlFor="audioUpload" className="mb-3 block text-sm font-medium text-gray-900">
                        Upload your audio file
                      </Label>
                      <Input
                        id="audioUpload"
                        type="file"
                        accept="audio/*,.wav,.mp3,.m4a,.aac,.ogg"
                        onChange={handleAudioUpload}
                      />
                      <p className="mt-2 text-xs text-gray-500">
                        Tip: WAV works best for the integrated Python classifier.
                      </p>
                    </div>
                  )}

                  <div className="mt-5 rounded-2xl border bg-white p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div className="flex items-center gap-3">
                        <div className="rounded-full bg-slate-100 p-2 text-slate-700">
                          <FileAudio className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {audioFile ? audioFile.name : "No audio sample selected yet"}
                          </p>
                          <p className="text-sm text-gray-500">
                            {audioFile
                              ? `Ready to analyze${audioFile.type ? ` • ${audioFile.type}` : ""}`
                              : "Your sample preview will appear here after recording or upload."}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className={audioFile ? "border-teal-300 text-teal-700" : ""}>
                        {audioFile ? "Sample ready" : "Pending"}
                      </Badge>
                    </div>

                    {audioPreviewUrl ? (
                      <audio controls className="mt-4 w-full">
                        <source src={audioPreviewUrl} />
                      </audio>
                    ) : null}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => router.push("/patient/dashboard")}>
                  Cancel
                </Button>
                <Button onClick={handleNext}>Continue</Button>
              </CardFooter>
            </Card>
          )}

          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Step 2: Select preferred date and time</CardTitle>
                <CardDescription>Choose a date and enter a time that works best for you</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Preferred Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.date && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.date ? format(formData.date, "PPP") : "Select a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.date}
                        onSelect={(date) => handleChange("date", date)}
                        initialFocus
                        disabled={(date) =>
                          date < new Date(new Date().setHours(0, 0, 0, 0)) || date.getDay() === 0 || date.getDay() === 6
                        }
                      />
                    </PopoverContent>
                  </Popover>
                  <p className="mt-1 text-xs text-gray-500">Note: Weekends are not available for appointments</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="preferredTime">Preferred Time (e.g., 10:30 AM)</Label>
                  <Input
                    id="preferredTime"
                    type="text"
                    placeholder="Enter preferred time"
                    value={selectedTime}
                    onChange={(event) => setSelectedTime(event.target.value)}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={handleBack}>
                  Back
                </Button>
                <Button onClick={handleNext} disabled={isLoadingCondition || isLoadingTherapists}>
                  {isLoadingCondition || isLoadingTherapists ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Find Therapists
                </Button>
              </CardFooter>
            </Card>
          )}

          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Step 3: Confirm your appointment</CardTitle>
                <CardDescription>
                  {isLoadingTherapists ? "Finding available therapists..." : "Review the classifier result and confirm your therapist."}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {isLoadingTherapists ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="mb-4 h-12 w-12 animate-spin text-teal-600" />
                    <p className="mt-2 text-sm text-gray-500">Analyzing audio and evaluating condition...</p>
                  </div>
                ) : (
                  <>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-600">Classifier Result</p>
                          <h3 className="mt-2 text-xl font-semibold text-gray-900">{classifiedCondition || "Awaiting result"}</h3>
                          <p className="mt-1 text-sm text-gray-600">
                            Source: {classifierSource || "Not available"}
                            {evaluationReasoning ? <><br /><span className="italic text-teal-700">"{evaluationReasoning}"</span></> : ""}
                            {audioAnalysis?.analyzed_window_seconds
                              ? ` • analyzed ${audioAnalysis.analyzed_window_seconds}s from your sample`
                              : ""}
                          </p>
                        </div>
                        <Badge className="w-fit bg-white text-slate-700" variant="secondary">
                          Audio-assisted intake
                        </Badge>
                      </div>

                      {audioAnalysis?.combined_probabilities ? (
                        <div className="mt-5 grid gap-3 md:grid-cols-3">
                          {Object.entries(audioAnalysis.combined_probabilities).map(([label, score]) => (
                            <div key={label} className="rounded-2xl border bg-white p-4">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-700">{label}</span>
                                <span className="text-sm font-semibold text-gray-900">{score}%</span>
                              </div>
                              <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100">
                                <div className="h-full rounded-full bg-teal-500" style={{ width: `${Math.min(score, 100)}%` }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>

                    {availableTherapists.length > 0 ? (
                      <div>
                        <Label>Select an available therapist:</Label>
                        <RadioGroup value={selectedTherapistId} onValueChange={setSelectedTherapistId} className="mt-2 space-y-3">
                          {availableTherapists.map((therapist) => (
                            <Label
                              key={therapist._id}
                              className="flex cursor-pointer items-center space-x-3 rounded-md border p-3 hover:bg-gray-50"
                            >
                              <RadioGroupItem value={therapist._id} id={therapist._id} />
                              <Avatar className="h-10 w-10">
                                <AvatarImage
                                  src={therapist.profilePictureUrl || "/placeholder.svg?height=40&width=40"}
                                  alt={therapist.name}
                                />
                                <AvatarFallback>{therapist.name.split(" ").map((part) => part[0]).join("")}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <span className="block font-medium">{therapist.name}</span>
                                <span className="block text-sm text-gray-500">{therapist.specialty}</span>
                              </div>
                            </Label>
                          ))}
                        </RadioGroup>
                      </div>
                    ) : (
                      <p className="py-8 text-center text-gray-500">
                        No therapists found matching your criteria for the selected date. Please try a different date or time.
                      </p>
                    )}
                  </>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={handleBack} disabled={isLoadingBooking}>
                  Back
                </Button>
                <Button onClick={handleConfirm} disabled={isLoadingTherapists || isLoadingBooking || availableTherapists.length === 0}>
                  {isLoadingBooking ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Confirm Booking
                </Button>
              </CardFooter>
            </Card>
          )}
        </main>
      </div>
    </div>
  )
}
