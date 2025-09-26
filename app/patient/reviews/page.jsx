"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, Plus, Calendar, User, MessageSquare } from "lucide-react"
import Link from "next/link"
import { UnifiedSidebar, HamburgerButton } from "@/components/unified-sidebar"
import { useToast } from "@/hooks/use-toast"

export default function PatientReviews() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchReviews()
  }, [])

  const fetchReviews = async () => {
    try {
      const response = await fetch('/api/patients/me')
      if (!response.ok) {
        throw new Error('Failed to fetch patient data')
      }
      const data = await response.json()
      
      // Get past appointments that have reviews
      const reviewedAppointments = data.pastAppointments?.filter(apt => 
        apt.status === 'completed' && apt.patientFeedback?.rating
      ) || []
      
      // Format reviews for display
      const formattedReviews = reviewedAppointments.map(apt => ({
        id: apt.id,
        therapistName: apt.therapistName,
        rating: apt.patientFeedback.rating,
        comment: apt.patientFeedback.comment || '',
        date: apt.date,
        appointmentType: apt.type,
        appointmentId: apt.id
      }))
      
      setReviews(formattedReviews)
    } catch (error) {
      console.error('Error fetching reviews:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch reviews. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading reviews...</p>
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
              <h2 className="text-lg font-bold">My Reviews</h2>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">My Reviews</h1>
              <p className="text-gray-600">View and manage your therapy session reviews</p>
            </div>
            <Link href="/patient/appointments">
              <Button variant="outline">
                <MessageSquare className="mr-2 h-4 w-4" />
                View Appointments
              </Button>
            </Link>
          </div>

      {reviews.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Star className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
            <p className="text-gray-600 mb-4">You haven't written any reviews for your therapy sessions.</p>
            <Link href="/patient/reviews/add">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Write Your First Review
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {reviews.map((review) => (
            <Card key={review.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex items-center">
                        {renderStars(review.rating)}
                      </div>
                      <Badge variant="outline">{review.appointmentType}</Badge>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {review.therapistName}
                    </h3>
                    
                    <p className="text-gray-700 mb-3">{review.comment}</p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(review.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span>Therapist</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 sm:mt-0 sm:ml-4 flex gap-2">
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
        </main>
      </div>
    </div>
  )
}
