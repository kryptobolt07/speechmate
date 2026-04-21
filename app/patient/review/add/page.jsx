"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { UnifiedSidebar, HamburgerButton } from "@/components/unified-sidebar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Loader2, ChevronRight, Star } from "lucide-react"
import { ReviewModal } from "@/components/ReviewModal"

export default function ReviewSelection() {
  const router = useRouter()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // Review Modal state
  const [selectedApt, setSelectedApt] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    fetchReviewable()
  }, [])

  const fetchReviewable = async () => {
    try {
      const response = await fetch('/api/patients/me')
      if (!response.ok) throw new Error('Failed to fetch data')
      const data = await response.json()
      const reviewable = data.pastAppointments?.filter(apt => !apt.patientFeedback?.rating) || []
      setAppointments(reviewable)
    } finally {
      setLoading(false)
    }
  }

  const handleReviewClick = (apt) => {
    setSelectedApt(apt)
    setIsModalOpen(true)
  }

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <UnifiedSidebar userType="patient" isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <div className="flex flex-col">
        <header className="sticky top-0 z-10 bg-white shadow-sm border-b">
          <div className="flex h-16 items-center gap-4 px-4">
            <HamburgerButton onClick={() => setIsSidebarOpen(true)} />
            <h2 className="text-lg font-bold">Write a Review</h2>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 max-w-4xl mx-auto w-full">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Choose a Session</h1>
            <p className="text-gray-500 mt-1">Select a completed therapy session to share your experience with the team.</p>
          </div>

          {appointments.length === 0 ? (
            <Card className="text-center py-16 border-dashed">
              <CardContent>
                <div className="bg-teal-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="h-8 w-8 text-teal-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">All sessions reviewed</h3>
                <p className="text-gray-500 mt-2 mb-8">You're completely up to date! Check back after your next session.</p>
                <Button onClick={() => router.push("/patient/dashboard")} variant="outline" className="px-8 border-teal-200 text-teal-700">Dashboard</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {appointments.map((apt) => (
                <Card 
                  key={apt.id} 
                  className="hover:border-teal-500 cursor-pointer transition-all hover:bg-white bg-gray-50/50 group"
                  onClick={() => handleReviewClick(apt)}
                >
                  <CardContent className="p-5 flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="bg-teal-100/50 text-teal-700 hover:bg-teal-100/50">{apt.type}</Badge>
                        <span className="text-[10px] text-gray-400 font-mono">#{apt.id.slice(-6).toUpperCase()}</span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-teal-700 transition-colors">{apt.therapistName}</h3>
                      <div className="flex gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-teal-500" /> {apt.date}</span>
                        <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-teal-500" /> {apt.time}</span>
                      </div>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-sm group-hover:bg-teal-600 group-hover:text-white transition-all">
                      <ChevronRight className="h-5 w-5" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>

        <ReviewModal 
          appointment={selectedApt}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={fetchReviewable}
        />
      </div>
    </div>
  )
}
