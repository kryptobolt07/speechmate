"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Star, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

const SURVEY_QUESTIONS = [
  { key: "communication",   label: "Communication",   desc: "How clearly did the therapist explain things?" },
  { key: "punctuality",     label: "Punctuality",     desc: "Did the session start/end on time?" },
  { key: "effectiveness",   label: "Effectiveness",   desc: "How helpful was the session?" },
  { key: "friendliness",    label: "Friendliness",    desc: "How comfortable did you feel?" },
  { key: "professionalism", label: "Professionalism", desc: "Was the therapist well-prepared?" },
]

function StarRow({ value, onChange, size = "md" }) {
  const [hovered, setHovered] = useState(0)
  const sz = size === "lg" ? "h-8 w-8" : "h-5 w-5"
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="transition-transform hover:scale-110 focus:outline-none"
        >
          <Star className={`${sz} ${star <= (hovered || value) ? "fill-amber-400 text-amber-400" : "text-gray-200"}`} />
        </button>
      ))}
    </div>
  )
}

export function ReviewModal({ appointment, isOpen, onClose, onSuccess }) {
  const { toast } = useToast()
  const [submitting, setSubmitting] = useState(false)
  const [overallRating, setOverallRating] = useState(0)
  const [survey, setSurvey] = useState({ communication: 0, punctuality: 0, effectiveness: 0, friendliness: 0, professionalism: 0 })
  const [comment, setComment] = useState("")

  const handleSubmit = async () => {
    const allSurveyFilled = Object.values(survey).every(v => v > 0)
    if (overallRating === 0 || !allSurveyFilled) {
      toast({ variant: "destructive", title: "Incomplete", description: "Please provide all ratings." })
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          therapistId: appointment.therapistId?._id || appointment.therapistId, 
          appointmentId: appointment.id || appointment._id, 
          rating: overallRating, 
          comment, 
          survey 
        })
      })
      if (!res.ok) throw new Error("Failed to submit")
      
      toast({ title: "Feedback Shared!", description: "Sent to the therapist and admin." })
      onSuccess?.()
      onClose()
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: err.message })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-teal-900">
            Rate Session with {appointment?.therapistName || "Therapist"}
          </DialogTitle>
          <DialogDescription>
            Session on {appointment?.date}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          <div className="p-5 bg-teal-50 rounded-2xl border border-teal-100 flex flex-col items-center">
            <p className="text-xs font-bold text-teal-600 uppercase mb-3">Overall Rating</p>
            <StarRow value={overallRating} onChange={setOverallRating} size="lg" />
          </div>

          <div className="space-y-4">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Performance Metrics</p>
            {SURVEY_QUESTIONS.map(q => (
              <div key={q.key} className="flex items-center justify-between gap-4 py-2 border-b border-gray-50 last:border-0">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-700">{q.label}</p>
                  <p className="text-[10px] text-gray-400">{q.desc}</p>
                </div>
                <StarRow value={survey[q.key]} onChange={v => setSurvey(p => ({ ...p, [q.key]: v }))} />
              </div>
            ))}
          </div>

          <div className="bg-gray-50/50 p-4 rounded-xl space-y-2">
             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Share more details</p>
             <Textarea 
               placeholder="How was your experience? Any suggestions for improvement?"
               value={comment}
               onChange={e => setComment(e.target.value)}
               className="bg-white border-gray-200 focus:ring-teal-500"
               rows={3}
             />
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="ghost" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button 
              className="flex-[2] bg-teal-600 hover:bg-teal-700 h-12 text-md font-bold" 
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Share with Team"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
