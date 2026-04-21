'use client'

import { useEffect, useState } from "react"
import { UnifiedSidebar, HamburgerButton } from "@/components/unified-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Plus, Loader2, Star } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { ReviewModal } from "@/components/ReviewModal"

export default function PatientDashboard() {
  const [patientData, setPatientData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const { toast } = useToast()

  // Review Modal state
  const [selectedApt, setSelectedApt] = useState(null)
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)

  const fetchPatientData = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/patients/me")
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      const data = await response.json()
      setPatientData(data)
    } catch (e) {
      setError(e.message)
      toast({ variant: "destructive", title: "Error", description: e.message })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPatientData()
  }, [])

  const handleLeaveReview = (apt) => {
    setSelectedApt(apt)
    setIsReviewModalOpen(true)
  }

  if (isLoading) return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      <span className="ml-2">Loading your dashboard...</span>
    </div>
  )

  if (error || !patientData) return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <h2 className="text-lg font-medium text-red-600">Error Loading Dashboard</h2>
        <p className="mt-2 text-gray-500">{error || "No data available"}</p>
        <Link href="/login"><Button variant="outline" className="mt-4">Back to Login</Button></Link>
      </div>
    </div>
  )

  const upcomingAppointments = patientData.upcomingAppointments ?? []
  const pastAppointments = patientData.pastAppointments ?? []
  const assignedTherapist = patientData.assignedTherapist
  const patientName = patientData.name || "Patient"
  const patientInitials = patientName.split(" ").map((n) => n[0]).join("") || "P"

  return (
    <div className="min-h-screen bg-gray-50">
      <UnifiedSidebar userType="patient" isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <div className="flex flex-col">
        <header className="sticky top-0 z-10 bg-white shadow-sm border-b">
          <div className="flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-4">
              <HamburgerButton onClick={() => setIsSidebarOpen(true)} />
              <h2 className="text-lg font-bold text-teal-900">Patient Dashboard</h2>
            </div>
            <Avatar className="h-8 w-8 ring-2 ring-teal-50">
              <AvatarImage src={patientData.profilePictureUrl} />
              <AvatarFallback className="text-xs font-bold bg-teal-600 text-white">{patientInitials}</AvatarFallback>
            </Avatar>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full">
          <div className="mb-6 md:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Welcome, {patientName.split(" ")[0]}</h1>
              <p className="text-gray-500 text-sm">Your speech therapy journey at a glance</p>
            </div>
            <div className="flex gap-2">
              <Link href="/patient/book" className="flex-1 sm:flex-none">
                <Button className="w-full bg-teal-600 hover:bg-teal-700 shadow-md">
                  <Plus className="mr-2 h-4 w-4" /> Book New
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
            {/* Upcoming Appointments */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3 border-b border-gray-50">
                <CardTitle className="text-lg font-bold">Upcoming Sessions</CardTitle>
                <CardDescription>Don't miss your next practice</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-4">
                  {upcomingAppointments.length > 0 ? (
                    upcomingAppointments.map((appointment) => (
                      <div key={appointment.id} className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                        <div className="rounded-full bg-teal-50 p-2.5">
                          <Clock className="h-5 w-5 text-teal-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-900 truncate">{appointment.therapistName}</p>
                          <div className="flex gap-3 text-xs text-gray-500 mt-1">
                            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {appointment.date}</span>
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {appointment.time}</span>
                          </div>
                        </div>
                        <Badge className="bg-teal-100 text-teal-700 hover:bg-teal-100 border-none capitalize">
                          {appointment.status}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10">
                      <p className="text-gray-400 text-sm italic">No upcoming sessions</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Sessions / Leave Feedback */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3 border-b border-gray-50">
                <CardTitle className="text-lg font-bold">Recent Sessions</CardTitle>
                <CardDescription>How was your experience?</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-4">
                  {pastAppointments.length > 0 ? (
                    pastAppointments.slice(0, 4).map((apt) => (
                      <div key={apt.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-teal-50/20 transition-colors">
                        <div className="min-w-0">
                          <p className="font-bold text-gray-900 truncate text-sm">{apt.therapistName}</p>
                          <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider mt-0.5">{apt.date}</p>
                        </div>
                        {apt.patientFeedback?.rating ? (
                          <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-full border border-amber-100">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                            <span className="text-xs font-bold text-amber-700">{apt.patientFeedback.rating}</span>
                          </div>
                        ) : (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-8 text-[11px] font-bold border-teal-200 text-teal-700 hover:bg-teal-600 hover:text-white transition-all shadow-sm"
                            onClick={() => handleLeaveReview(apt)}
                          >
                            Leave Feedback
                          </Button>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-center py-10 text-gray-400 text-sm">No recent sessions found</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 mt-6">
            {/* Therapist Info */}
            <Card className="shadow-sm bg-gradient-to-br from-white to-teal-50/20">
              <CardHeader className="pb-3 border-b border-gray-50">
                <CardTitle className="text-lg font-bold">Assigned Therapist</CardTitle>
              </CardHeader>
              <CardContent className="pt-5">
                {assignedTherapist ? (
                  <div className="flex items-center space-x-5">
                    <Avatar className="h-16 w-16 ring-4 ring-white shadow-lg">
                      <AvatarImage src={assignedTherapist.profilePictureUrl} />
                      <AvatarFallback className="bg-teal-600 text-white font-bold text-xl">
                        {assignedTherapist.name?.split(" ").map((n) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <h3 className="font-bold text-gray-900 text-lg">{assignedTherapist.name}</h3>
                      <Badge variant="secondary" className="bg-teal-100 text-teal-700 border-none">{assignedTherapist.specialty}</Badge>
                      <div className="pt-2">
                        <Link href="/patient/review">
                          <Button variant="link" className="p-0 h-auto text-xs text-teal-600 hover:text-teal-700 font-semibold underline-offset-4 hover:underline">
                            View therapist history
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">Finding the best therapist for you...</p>
                )}
              </CardContent>
            </Card>

            {/* Quick Resources */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3 border-b border-gray-50">
                <CardTitle className="text-lg font-bold">Resources</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 flex flex-col sm:flex-row gap-3">
                <div className="flex-1 p-4 border border-teal-100 rounded-xl bg-teal-50/30 group hover:bg-teal-50 transition-colors cursor-pointer">
                  <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center mb-3 text-teal-600 shadow-sm border border-teal-50">
                    <Plus className="h-5 w-5" />
                  </div>
                  <p className="font-bold text-gray-900">Fluency Guide</p>
                  <p className="text-[10px] text-gray-500 mt-1">Daily breathing exercises</p>
                </div>
                <div className="flex-1 p-4 border border-teal-100 rounded-xl bg-teal-50/30 group hover:bg-teal-50 transition-colors cursor-pointer">
                  <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center mb-3 text-teal-600 shadow-sm border border-teal-50">
                    <Clock className="h-5 w-5" />
                  </div>
                  <p className="font-bold text-gray-900">Progress Log</p>
                  <p className="text-[10px] text-gray-500 mt-1">Track your improvements</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>

        <ReviewModal 
          appointment={selectedApt}
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          onSuccess={fetchPatientData}
        />
      </div>
    </div>
  )
}
