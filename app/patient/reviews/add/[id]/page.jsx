"use client"

import { useState, useEffect } from "react"
import { UnifiedSidebar, HamburgerButton } from "@/components/unified-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, Calendar, Clock, MapPin, User } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export default function AddReview({ params }) {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [feedback, setFeedback] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [appointment, setAppointment] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    fetchAppointment()
  }, [params.id])

  const fetchAppointment = async () => {
    try {
      const response = await fetch(`/api/appointments/${params.id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch appointment')
      }
      const data = await response.json()
      
      // Check if appointment is completed and can be reviewed
      if (data.status !== 'completed') {
        toast({
          variant: "destructive",
          title: "Cannot review",
          description: "You can only review completed sessions.",
        })
        router.push('/patient/appointments')
        return
      }

      if (data.patientFeedback && data.patientFeedback.rating) {
        toast({
          variant: "destructive",
          title: "Already reviewed",
          description: "You have already reviewed this session.",
        })
        router.push('/patient/appointments')
        return
      }

      setAppointment(data)
    } catch (error) {
      console.error('Error fetching appointment:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch appointment details.",
      })
      router.push('/patient/appointments')
    } finally {
      setLoading(false)
    }
  }

  const handleRatingClick = (selectedRating) => {
    setRating(selectedRating)
  }

  const handleRatingHover = (hoveredRating) => {
    setHoveredRating(hoveredRating)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (rating === 0) {
      toast({
        variant: "destructive",
        title: "Rating required",
        description: "Please select a star rating before submitting.",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/appointments/${params.id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, comment: feedback })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to submit review')
      }

      toast({
        title: "Review submitted",
        description: "Thank you for your feedback!",
      })

      router.push("/patient/appointments")
    } catch (error) {
      console.error('Error submitting review:', error)
      toast({
        variant: "destructive",
        title: "Submission failed",
        description: error.message || "There was a problem submitting your review. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading appointment details...</p>
        </div>
      </div>
    )
  }

  if (!appointment) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-lg font-medium text-gray-900 mb-2">Appointment not found</h2>
          <p className="text-gray-600">The appointment you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UnifiedSidebar userType="patient" isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <div className="flex flex-col">
        <header className="sticky top-0 z-10 bg-white shadow-sm border-b">
          <div className="flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-4">
              <HamburgerButton onClick={() => setIsSidebarOpen(true)} />
              <h2 className="text-lg font-bold">Add Review</h2>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 max-w-3xl mx-auto w-full">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Leave a Review</h1>
            <p className="text-gray-600 mt-1">Share your experience with your therapist</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Rate your session</CardTitle>
              <CardDescription>Your feedback helps improve our services and assists other patients</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src="/placeholder-user.jpg" alt={appointment.therapistId?.name} />
                  <AvatarFallback>
                    {appointment.therapistId?.name?.split(' ').map(n => n[0]).join('') || 'T'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-medium">{appointment.therapistId?.name || 'Unknown Therapist'}</h3>
                  <p className="text-sm text-gray-500">{appointment.therapistId?.specialty || 'Speech Therapist'}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(appointment.appointmentDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{appointment.appointmentTime}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
                    <MapPin className="h-4 w-4" />
                    <span>{appointment.hospitalId?.name || 'Unknown Location'}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
                    <User className="h-4 w-4" />
                    <span>{appointment.type} - {appointment.condition || 'General'}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <p className="font-medium">How would you rate your experience?</p>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleRatingClick(star)}
                      onMouseEnter={() => handleRatingHover(star)}
                      onMouseLeave={() => handleRatingHover(0)}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`h-8 w-8 ${
                          star <= (hoveredRating || rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                {rating > 0 && (
                  <p className="text-sm text-gray-600">
                    {rating === 1 && "Poor - Did not meet expectations"}
                    {rating === 2 && "Fair - Below average experience"}
                    {rating === 3 && "Good - Average experience"}
                    {rating === 4 && "Very Good - Above average experience"}
                    {rating === 5 && "Excellent - Exceeded expectations"}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="feedback" className="font-medium">
                  Additional feedback (optional)
                </label>
                <Textarea
                  id="feedback"
                  placeholder="Share details of your experience to help us improve..."
                  rows={5}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => router.push("/patient/dashboard")}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Review"}
              </Button>
            </CardFooter>
          </Card>
        </main>
      </div>
    </div>
  )
}

