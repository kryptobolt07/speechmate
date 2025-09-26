'use client' // Convert to client component

import { useEffect, useState } from "react" // Import hooks
import { UnifiedSidebar, HamburgerButton } from "@/components/unified-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Bell, CheckCircle, Clock, FileText, Loader2, Menu, X } from "lucide-react" // Added Menu, X
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast" // Ensure correct path

export default function TherapistDashboard() {
  // State for schedule data, loading, and errors
  const [scheduleData, setScheduleData] = useState(null)
  const [therapistInfo, setTherapistInfo] = useState(null) // To store therapist name etc.
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false) // State for mobile sidebar
  const { toast } = useToast()

  // Mock data // Removed mock data
  // const todayAppointments = [ ... ];
  // const weekAppointments = [ ... ];

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        // Fetch from the protected endpoint. Assumes middleware handles auth.
        const response = await fetch("/api/therapists/me/schedule")

        if (!response.ok) {
          let errorMsg = `HTTP error! status: ${response.status}`;
          try {
            const errorData = await response.json();
            errorMsg = errorData.error || errorMsg;
          } catch (e) { /* Ignore */ }
          throw new Error(errorMsg)
        }

        const data = await response.json()
        setScheduleData(data) // Contains today, week, patients arrays (currently mock/empty from API)
        setTherapistInfo(data.therapist) // Store therapist info if returned by API

      } catch (e) {
        console.error("Failed to fetch therapist schedule:", e)
        setError(e.message)
        toast({
          variant: "destructive",
          title: "Error Loading Dashboard",
          description: e.message || "Could not fetch your schedule. Please try logging in again.",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [toast])

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

  // Handle case where data is missing
  if (!scheduleData) {
     return (
       <div className="flex min-h-screen items-center justify-center bg-gray-50">
         <p className="text-gray-600">No schedule data available.</p>
       </div>
     )
  }

  // Extract data for easier use
  const todayAppointments = scheduleData.today ?? []
  const weekAppointments = scheduleData.week ?? []
  // const patientsList = scheduleData.patients ?? [] // Not used directly in this part of UI yet
  const therapistName = therapistInfo?.name || "Therapist"
  const therapistInitials = therapistName.split(" ").map((n) => n[0]).join("") || "T"

  return (
    <div className="min-h-screen bg-gray-50">
      <UnifiedSidebar userType="therapist" isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <div className="flex flex-col">
        <header className="sticky top-0 z-10 bg-white shadow-sm border-b">
          <div className="flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-4">
              <HamburgerButton onClick={() => setIsSidebarOpen(true)} />
              <h2 className="text-lg font-bold">Therapist Dashboard</h2>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="hidden sm:flex">
                <Bell className="h-5 w-5" />
              </Button>
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder.svg?height=32&width=32" alt={therapistName} />
                <AvatarFallback className="text-xs">{therapistInitials}</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">
          <div className="mb-6 md:mb-8">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">Welcome, {therapistName}</h1>
            <p className="text-gray-600 mt-1">Here's your schedule overview</p>
          </div>

          <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Today's Sessions</CardTitle>
                <CardDescription>May 10, 2025</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{todayAppointments.length}</div>
                <p className="text-sm text-gray-500">Scheduled appointments</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>This Week</CardTitle>
                <CardDescription>May 10 - May 16</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{todayAppointments.length + weekAppointments.length}</div>
                <p className="text-sm text-gray-500">Total appointments</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Patient Reviews</CardTitle>
                <CardDescription>Last 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4.8/5</div>
                <p className="text-sm text-gray-500">Average rating from 12 reviews</p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6 md:mt-8">
            <Tabs defaultValue="today">
              <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between mb-4 gap-2">
                <TabsList>
                  <TabsTrigger value="today">Today</TabsTrigger>
                  <TabsTrigger value="week">This Week</TabsTrigger>
                  <TabsTrigger value="calendar">Full Calendar</TabsTrigger>
                </TabsList>
                <Link href="/therapist/schedule">
                  <Button variant="outline" size="sm" className="w-full sm:w-auto">
                    View Full Schedule
                  </Button>
                </Link>
              </div>

              <TabsContent value="today" className="space-y-4">
                {todayAppointments.length > 0 ? (
                  todayAppointments.map((appointment) => (
                    <Card key={appointment.id}>
                      <CardContent className="p-0">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center p-4 border-l-4 border-teal-500">
                          <div className="mr-4">
                            <Avatar>
                              <AvatarImage src="/placeholder.svg?height=40&width=40" alt={appointment.patient} />
                              <AvatarFallback>
                                {appointment.patient
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                          <div className="flex-1 w-full sm:w-auto mt-3 sm:mt-0 sm:ml-4">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                              <div>
                                <h3 className="font-medium">{appointment.patient}</h3>
                                <p className="text-sm text-gray-500">{appointment.condition}</p>
                              </div>
                              <Badge variant="outline" className="ml-0 sm:ml-2 mt-1 sm:mt-0">
                                {appointment.time} • {appointment.duration}
                              </Badge>
                            </div>
                          </div>
                          <div className="ml-0 sm:ml-4 mt-3 sm:mt-0 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
                            <Button size="sm" variant="outline">
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Complete
                            </Button>
                            <Button size="sm" variant="outline">
                              <FileText className="mr-2 h-4 w-4" />
                              Notes
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                  ) : (
                    <Card><CardContent className="p-6 text-center text-gray-500">No appointments scheduled for today.</CardContent></Card>
                  )}
              </TabsContent>

              <TabsContent value="week" className="space-y-4">
                {weekAppointments.length > 0 ? (
                  weekAppointments.map((appointment) => (
                    <Card key={appointment.id}>
                      <CardContent className="p-0">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center p-4 border-l-4 border-teal-500">
                          <div className="mr-4">
                            <Avatar>
                              <AvatarImage src="/placeholder.svg?height=40&width=40" alt={appointment.patient} />
                              <AvatarFallback>
                                {appointment.patient
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                          <div className="flex-1 w-full sm:w-auto mt-3 sm:mt-0 sm:ml-4">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                              <div>
                                <h3 className="font-medium">{appointment.patient}</h3>
                                <p className="text-sm text-gray-500">{appointment.condition}</p>
                              </div>
                              <Badge variant="outline" className="ml-0 sm:ml-2 mt-1 sm:mt-0">
                                {appointment.date} • {appointment.time}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                  ) : (
                     <Card><CardContent className="p-6 text-center text-gray-500">No appointments scheduled for this week.</CardContent></Card>
                  )}
              </TabsContent>

              <TabsContent value="calendar">
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center py-12">
                      <Clock className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-4 text-lg font-medium">Calendar View</h3>
                      <p className="mt-2 text-sm text-gray-500">View your full schedule in calendar format</p>
                      <Link href="/therapist/schedule">
                        <Button className="mt-4">Open Calendar</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  )
}

