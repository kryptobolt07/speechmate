"use client"

import { useEffect, useState } from "react"
import { TherapistSidebar } from "@/components/therapist-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Bell, CheckCircle, Clock, FileText } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export default function TherapistDashboard() {
  const [scheduleData, setScheduleData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }

    // Fetch therapist schedule
    const fetchSchedule = async () => {
      try {
        const response = await fetch("/api/therapists/me/schedule", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error("Failed to fetch schedule data")
        }

        const data = await response.json()
        setScheduleData(data)
      } catch (error) {
        console.error("Error fetching schedule data:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load your schedule. Please try again.",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchSchedule()
  }, [router, toast])

  const handleMarkComplete = async (appointmentId) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "completed" }),
      })

      if (!response.ok) {
        throw new Error("Failed to update appointment")
      }

      // Update the local state
      setScheduleData((prev) => ({
        ...prev,
        today: prev.today.map((appointment) =>
          appointment.id === appointmentId ? { ...appointment, status: "completed" } : appointment,
        ),
      }))

      toast({
        title: "Session completed",
        description: "The appointment has been marked as completed.",
      })
    } catch (error) {
      console.error("Error updating appointment:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update the appointment. Please try again.",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <Clock className="mx-auto h-12 w-12 animate-spin text-teal-600" />
          <h2 className="mt-4 text-lg font-medium">Loading your schedule...</h2>
        </div>
      </div>
    )
  }

  if (!scheduleData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-lg font-medium">No schedule data available</h2>
          <p className="mt-2 text-gray-500">Please try logging in again</p>
          <Button className="mt-4" onClick={() => router.push("/login")}>
            Back to Login
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="hidden md:flex md:w-64 md:flex-col">
        <TherapistSidebar />
      </div>
      <div className="flex-1">
        <header className="bg-white shadow-sm border-b">
          <div className="flex h-16 items-center justify-between px-4">
            <h2 className="text-xl font-bold">Therapist Dashboard</h2>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
              <Avatar>
                <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
                <AvatarFallback>SJ</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>
        <main className="p-6">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Welcome, Dr. Sarah</h1>
            <p className="text-gray-600 mt-1">Here's your schedule for today</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Today's Sessions</CardTitle>
                <CardDescription>May 10, 2025</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{scheduleData.today.length}</div>
                <p className="text-sm text-gray-500">Scheduled appointments</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>This Week</CardTitle>
                <CardDescription>May 10 - May 16</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{scheduleData.today.length + scheduleData.week.length}</div>
                <p className="text-sm text-gray-500">Total appointments</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Patient Count</CardTitle>
                <CardDescription>Active patients</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{scheduleData.patients.length}</div>
                <p className="text-sm text-gray-500">Under your care</p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8">
            <Tabs defaultValue="today">
              <div className="flex items-center justify-between mb-4">
                <TabsList>
                  <TabsTrigger value="today">Today</TabsTrigger>
                  <TabsTrigger value="week">This Week</TabsTrigger>
                  <TabsTrigger value="patients">Patients</TabsTrigger>
                </TabsList>
                <Link href="/dashboard/therapist/schedule">
                  <Button variant="outline" size="sm">
                    View Full Schedule
                  </Button>
                </Link>
              </div>

              <TabsContent value="today" className="space-y-4">
                {scheduleData.today.map((appointment) => (
                  <Card key={appointment.id}>
                    <CardContent className="p-0">
                      <div className="flex items-center p-4 border-l-4 border-teal-500">
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
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium">{appointment.patient}</h3>
                              <p className="text-sm text-gray-500">{appointment.condition}</p>
                            </div>
                            <Badge variant="outline" className="ml-2">
                              {appointment.time} • {appointment.duration}
                            </Badge>
                          </div>
                        </div>
                        <div className="ml-4 flex space-x-2">
                          <Button size="sm" variant="outline" onClick={() => handleMarkComplete(appointment.id)}>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Complete
                          </Button>
                          <Link href={`/dashboard/therapist/notes/${appointment.id}`}>
                            <Button size="sm" variant="outline">
                              <FileText className="mr-2 h-4 w-4" />
                              Notes
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {scheduleData.today.length === 0 && (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <Clock className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-4 text-lg font-medium">No appointments today</h3>
                      <p className="mt-2 text-sm text-gray-500">Enjoy your day off or check your upcoming schedule</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="week" className="space-y-4">
                {scheduleData.week.map((appointment) => (
                  <Card key={appointment.id}>
                    <CardContent className="p-0">
                      <div className="flex items-center p-4 border-l-4 border-teal-500">
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
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium">{appointment.patient}</h3>
                              <p className="text-sm text-gray-500">{appointment.condition}</p>
                            </div>
                            <Badge variant="outline" className="ml-2">
                              {appointment.date} • {appointment.time}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {scheduleData.week.length === 0 && (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <Clock className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-4 text-lg font-medium">No upcoming appointments this week</h3>
                      <p className="mt-2 text-sm text-gray-500">Your schedule is clear for the rest of the week</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="patients" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Your Patients</CardTitle>
                    <CardDescription>Patients under your care</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="py-3 text-left font-medium">Patient</th>
                            <th className="py-3 text-left font-medium">Condition</th>
                            <th className="py-3 text-left font-medium">Next Appointment</th>
                            <th className="py-3 text-left font-medium">Progress</th>
                            <th className="py-3 text-left font-medium">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {scheduleData.patients.map((patient) => (
                            <tr key={patient.id} className="border-b">
                              <td className="py-3">{patient.name}</td>
                              <td className="py-3">{patient.condition}</td>
                              <td className="py-3">{patient.nextAppointment}</td>
                              <td className="py-3">
                                <Badge
                                  variant={
                                    patient.progress === "Improving"
                                      ? "default"
                                      : patient.progress === "Stable"
                                        ? "secondary"
                                        : patient.progress === "Needs attention"
                                          ? "destructive"
                                          : "outline"
                                  }
                                >
                                  {patient.progress}
                                </Badge>
                              </td>
                              <td className="py-3">
                                <Link href={`/dashboard/therapist/patients/${patient.id}`}>
                                  <Button size="sm" variant="outline">
                                    View
                                  </Button>
                                </Link>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
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

