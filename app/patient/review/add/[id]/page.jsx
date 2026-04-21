"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { UnifiedSidebar, HamburgerButton } from "@/components/unified-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { Star, Calendar, Clock, MapPin, Loader2, CheckCircle, AlertCircle } from "lucide-react"

const SURVEY_QUESTIONS = [
  { key: "communication",   label: "Communication",   desc: "How clearly did the therapist explain your treatment?" },
  { key: "punctuality",     label: "Punctuality",     desc: "Did the session start and end on time?" },
  { key: "effectiveness",   label: "Effectiveness",   desc: "How helpful was the session for your progress?" },
  { key: "friendliness",    label: "Friendliness",    desc: "How comfortable did the therapist make you feel?" },
  { key: "professionalism", label: "Professionalism", desc: "Was the therapist professional and well-prepared?" },
]

const RATING_LABELS = { 0: "", 1: "Poor", 2: "Fair", 3: "Good", 4: "Very Good", 5: "Excellent" }

function StarRow({ value, onChange, size = "md" }) {
  const [hovered, setHovered] = useState(0)
  const sz = size === "lg" ? "h-9 w-9" : "h-6 w-6"
  return (
    <div className="flex gap-1.5">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="transition-transform hover:scale-110 active:scale-95 focus:outline-none"
        >
          <Star className={`${sz} transition-colors ${star <= (hovered || value) ? "fill-amber-400 text-amber-400" : "text-gray-200 hover:text-amber-200"}`} />
        </button>
      ))}
    </div>
  )
}

export default function AddReview({ params }) {
  // Next.js 15: params is a Promise — use React.use() to unwrap it
  const { id: appointmentId } = use(params)

  const router = useRouter()
  const { toast } = useToast()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const [state, setState] = useState({ loading: true, submitting: false, done: false, error: null })
  const [appointment, setAppointment] = useState(null)

  const [overallRating, setOverallRating] = useState(0)
  const [survey, setSurvey] = useState({ communication: 0, punctuality: 0, effectiveness: 0, friendliness: 0, professionalism: 0 })
  const [comment, setComment] = useState("")

  useEffect(() => {
    if (!appointmentId) return
    fetch(`/api/appointments/${appointmentId}`)
      .then(async r => {
        const data = await r.json()
        if (!r.ok) throw new Error(data.error || `HTTP ${r.status}`)
        return data
      })
      .then(data => {
        if (data.patientFeedback?.rating) {
          toast({ variant: "destructive", title: "Already reviewed", description: "You've already submitted a review for this session." })
          router.push("/patient/dashboard")
          return
        }
        setAppointment(data)
        setState(s => ({ ...s, loading: false }))
      })
      .catch(err => {
        setState(s => ({ ...s, loading: false, error: err.message }))
      })
  }, [appointmentId])

  const allSurveyFilled = Object.values(survey).every(v => v > 0)

  const handleSubmit = async () => {
    if (overallRating === 0) {
      toast({ variant: "destructive", title: "Overall rating required", description: "Please click a star to rate the overall experience." })
      return
    }
    if (!allSurveyFilled) {
      toast({ variant: "destructive", title: "Survey incomplete", description: "Please rate all 5 survey questions before submitting." })
      return
    }

    setState(s => ({ ...s, submitting: true }))
    try {
      const therapistId = appointment.therapistId?._id ?? appointment.therapistId
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ therapistId, appointmentId, rating: overallRating, comment, survey })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Submission failed")
      setState(s => ({ ...s, submitting: false, done: true }))
    } catch (err) {
      setState(s => ({ ...s, submitting: false }))
      toast({ variant: "destructive", title: "Failed to submit", description: err.message })
    }
  }

  // ── Loading ──
  if (state.loading) return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      <span className="ml-3 text-gray-600">Loading session details…</span>
    </div>
  )

  // ── Error ──
  if (state.error) return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center max-w-sm p-8">
        <AlertCircle className="h-14 w-14 text-red-400 mx-auto mb-4" />
        <h2 className="text-lg font-bold text-gray-800 mb-2">Could not load session</h2>
        <p className="text-gray-500 text-sm mb-6">{state.error}</p>
        <Button onClick={() => router.push("/patient/review")} variant="outline">Back to Dashboard</Button>
      </div>
    </div>
  )

  // ── Success ──
  if (state.done) return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center max-w-md p-10">
        <CheckCircle className="h-20 w-20 text-teal-500 mx-auto mb-6" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Thank you!</h1>
        <p className="text-gray-500 mb-8">Your feedback helps us recognise great therapists and improve care for everyone.</p>
        <Button onClick={() => router.push("/patient/review")} className="bg-teal-600 hover:bg-teal-700">
          Back to Dashboard
        </Button>
      </div>
    </div>
  )

  if (!appointment) return null

  const therapist = appointment.therapistId
  const hospital  = appointment.hospitalId

  return (
    <div className="min-h-screen bg-gray-50">
      <UnifiedSidebar userType="patient" isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <div className="flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-white shadow-sm border-b">
          <div className="flex h-16 items-center gap-4 px-4">
            <HamburgerButton onClick={() => setIsSidebarOpen(true)} />
            <h2 className="text-lg font-bold text-gray-900">Leave a Review</h2>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 max-w-3xl mx-auto w-full space-y-5">

          {/* ── Therapist Banner ── */}
          <Card className="border-teal-100 bg-gradient-to-r from-teal-50 to-white overflow-hidden">
            <CardContent className="pt-6 pb-5">
              <div className="flex items-center gap-5">
                <Avatar className="h-20 w-20 ring-4 ring-white shadow-md">
                  <AvatarImage src={therapist?.profilePictureUrl} />
                  <AvatarFallback className="bg-teal-600 text-white text-xl font-bold">
                    {therapist?.name?.split(" ").map(n => n[0]).join("") || "T"}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-gray-900">{therapist?.name || "Your Therapist"}</h3>
                  <p className="text-teal-600 font-semibold text-sm">{therapist?.specialty || "Speech Therapist"}</p>
                  <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-teal-500" />
                      {new Date(appointment.appointmentDate).toLocaleDateString("en-IN", { dateStyle: "long" })}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-teal-500" />
                      {appointment.appointmentTime}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-teal-500" />
                      {hospital?.name || "Hospital"}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ── Overall Rating ── */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Overall Experience</CardTitle>
              <CardDescription>How would you rate this session overall?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <StarRow value={overallRating} onChange={setOverallRating} size="lg" />
              {overallRating > 0 && (
                <span className="inline-block text-sm font-semibold text-teal-700 bg-teal-50 border border-teal-100 rounded-full px-3 py-0.5">
                  {RATING_LABELS[overallRating]}
                </span>
              )}
            </CardContent>
          </Card>

          {/* ── Survey ── */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Detailed Survey</CardTitle>
              <CardDescription>Rate each aspect from 1 (poor) to 5 (excellent)</CardDescription>
            </CardHeader>
            <CardContent className="divide-y divide-gray-50">
              {SURVEY_QUESTIONS.map(q => (
                <div key={q.key} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{q.label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{q.desc}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <StarRow value={survey[q.key]} onChange={v => setSurvey(p => ({ ...p, [q.key]: v }))} />
                      {survey[q.key] > 0 && (
                        <span className="text-xs font-bold text-teal-600 w-16">{RATING_LABELS[survey[q.key]]}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* ── Comment ── */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>
                Additional Comments <span className="text-gray-400 font-normal text-sm">(optional)</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Share anything specific you'd like us or the therapist to know…"
                rows={4}
                value={comment}
                onChange={e => setComment(e.target.value)}
                className="resize-none"
              />
            </CardContent>
            <CardFooter className="flex justify-between gap-3 pt-2">
              <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
              <Button
                className="bg-teal-600 hover:bg-teal-700 text-white px-8"
                onClick={handleSubmit}
                disabled={state.submitting}
              >
                {state.submitting
                  ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Submitting…</>
                  : "Submit Review"}
              </Button>
            </CardFooter>
          </Card>

        </main>
      </div>
    </div>
  )
}
