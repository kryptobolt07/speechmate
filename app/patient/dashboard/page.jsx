'use client' // Convert to client component

import { useEffect, useState } from "react" // Import hooks
import { UnifiedSidebar, HamburgerButton } from "@/components/unified-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Bell, Calendar, Clock, Plus, Loader2, Menu, X } from "lucide-react" // Added Menu, X
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast" // Ensure correct path for useToast

export default function PatientDashboard() {
  // State for patient data, loading, and errors
  const [patientData, setPatientData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false) // State for mobile sidebar
  const { toast } = useToast()

  // Mock data // Removed mock data
  // const upcomingAppointments = [ ... ];
  // const pastAppointments = [ ... ];

  // Fetch data on component mount
  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        // Fetch from the protected endpoint. Assumes middleware handles auth
        // and the browser sends necessary cookies (e.g., JWT token).
        const response = await fetch("/api/patients/me")

        if (!response.ok) {
           // Try to parse error message from response body
          let errorMsg = `HTTP error! status: ${response.status}`;
          try {
            const errorData = await response.json();
            errorMsg = errorData.error || errorMsg;
          } catch (e) { /* Ignore parsing error */ }
          throw new Error(errorMsg)
        }

        const data = await response.json()
        setPatientData(data)
      } catch (e) {
        console.error("Failed to fetch patient data:", e)
        setError(e.message)
        toast({
          variant: "destructive",
          title: "Error Loading Dashboard",
          description: e.message || "Could not fetch your data. Please try logging in again.",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchPatientData()
  }, [toast]) // Dependency on toast

  // Handle Loading State
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
        <span className="ml-2">Loading your dashboard...</span>
      </div>
    )
  }

  // Handle Error State
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-lg font-medium text-red-600">Error Loading Dashboard</h2>
          <p className="mt-2 text-gray-500">{error}</p>
          <Link href="/login">
            <Button variant="outline" className="mt-4">Back to Login</Button>
          </Link>
        </div>
      </div>
    )
  }

  // Handle case where data is missing (shouldn't happen if no error)
  if (!patientData) {
     return (
       <div className="flex min-h-screen items-center justify-center bg-gray-50">
         <p className="text-gray-600">No dashboard data available.</p>
       </div>
     )
  }

  // Extract data for easier use, providing defaults
  // TODO: Update API /api/patients/me to return these fields
  const upcomingAppointments = patientData.upcomingAppointments ?? []
  const pastAppointments = patientData.pastAppointments ?? []
  const assignedTherapist = patientData.assignedTherapist // May be null/undefined
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
              <h2 className="text-lg font-bold">Patient Dashboard</h2>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="hidden sm:flex">
                <Bell className="h-5 w-5" />
              </Button>
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder.svg?height=32&width=32" alt={patientName} />
                <AvatarFallback className="text-xs">{patientInitials}</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">
          <div className="mb-6 md:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">Welcome, {patientName.split(" ")[0]}</h1>
            <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Link href="/patient/book">
                <Button className="w-full sm:w-auto">
                  <Plus className="mr-2 h-4 w-4" /> Book New Appointment
                </Button>
              </Link>
              <Link href="/patient/book-followup"> 
                <Button variant="outline" className="w-full sm:w-auto">
                  <Calendar className="mr-2 h-4 w-4" /> Book Follow-Up
                </Button>
              </Link>
            </div>
          </div>

          {/* Responsive Grid for cards */}
          <div className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-3">
            {/* Upcoming Appointments Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Upcoming Appointments</CardTitle>
                <CardDescription>Your scheduled sessions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingAppointments.length > 0 ? (
                    upcomingAppointments.map((appointment) => (
                      <div key={appointment.id} className="flex items-start space-x-4 rounded-lg border p-3">
                        <div className="rounded-full bg-teal-100 p-2">
                          <Clock className="h-5 w-5 text-teal-600" />
                        </div>
                        <div className="space-y-1">
                          {/* TODO: Adjust fields based on actual API response */}
                          <p className="font-medium">{appointment.therapistName || 'Therapist Name Missing'}</p>
                          <p className="text-sm text-gray-500">
                            {appointment.date} at {appointment.time}
                          </p>
                          <p className="text-sm text-gray-500">{appointment.location || 'Location Missing'}</p>
                          <div className="flex items-center pt-1">
                            <Badge variant={appointment.status === "confirmed" ? "default" : "outline"}>
                              {appointment.status || 'Unknown Status'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-gray-500">No upcoming appointments</p>
                      <Link href="/patient/book">
                        <Button variant="link" className="mt-2">
                          Book an appointment
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Assigned Therapist Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Your Therapist</CardTitle>
                <CardDescription>Your assigned healthcare provider</CardDescription>
              </CardHeader>
              <CardContent>
                {assignedTherapist ? (
                  <div className="flex items-start space-x-4">
                    <Avatar className="h-16 w-16">
                      {/* TODO: Adjust fields based on actual API response */}
                      <AvatarImage src={assignedTherapist.profilePictureUrl || "/placeholder.svg?height=64&width=64"} alt={assignedTherapist.name} />
                      <AvatarFallback>
                        {assignedTherapist.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-2">
                      <div>
                        <h3 className="font-medium">{assignedTherapist.name}</h3>
                        <p className="text-sm text-gray-500">{assignedTherapist.specialty || 'Specialty not listed'}</p>
                      </div>
                      {/* TODO: Define route for therapist profile view */}
                      {/* <Link href={`/patient/therapist/${assignedTherapist.id}`}> 
                        <Button variant="outline" size="sm">
                          View Profile
                        </Button>
                      </Link> */}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500">No therapist assigned yet</p>
                    {/* Optionally add a link or info on how to get assigned */}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Therapy Resources Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Therapy Resources</CardTitle>
                <CardDescription>Recommended materials</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="rounded-lg border p-3">
                    <h3 className="font-medium">Articulation Exercises</h3>
                    <p className="text-sm text-gray-500 mt-1">Daily practice for 'S' and 'R' sounds</p>
                    <Button variant="link" className="px-0 mt-1">
                      View exercises
                    </Button>
                  </div>
                  <div className="rounded-lg border p-3">
                    <h3 className="font-medium">Breathing Techniques</h3>
                    <p className="text-sm text-gray-500 mt-1">Video tutorials for speech fluency</p>
                    <Button variant="link" className="px-0 mt-1">
                      Watch videos
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

           {/* Past Appointments Section (if needed) - Make responsive */}
          <div className="mt-6 md:mt-8">
            {/* ... potentially another Card or Table for past appointments ... */}
            {/* Ensure overflow-x-auto and min-width on tables here too */} 
          </div>

        </main>
      </div>
    </div>
  )
}

