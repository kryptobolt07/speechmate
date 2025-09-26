"use client"

import { useState } from "react"
import { UnifiedSidebar, HamburgerButton } from "@/components/unified-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export default function AddReview({ params }) {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [feedback, setFeedback] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  // Mock appointment data (in a real app, you'd fetch this based on the ID)
  const appointment = {
    id: params.id,
    therapist: {
      name: "Dr. Sarah Johnson",
      specialty: "Speech-Language Pathologist",
      image: "/placeholder.svg?height=80&width=80",
    },
    date: "April 30, 2025",
    time: "11:00 AM",
    type: "Initial Assessment",
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
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Review submitted",
        description: "Thank you for your feedback!",
      })

      router.push("/patient/dashboard")
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Submission failed",
        description: "There was a problem submitting your review. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
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
                  <AvatarImage src={appointment.therapist.image} alt={appointment.therapist.name} />
                  <AvatarFallback>SJ</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">{appointment.therapist.name}</h3>
                  <p className="text-sm text-gray-500">{appointment.therapist.specialty}</p>
                  <p className="text-sm text-gray-500">
                    Session on {appointment.date} at {appointment.time}
                  </p>
                  <p className="text-sm text-gray-500">{appointment.type}</p>
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

