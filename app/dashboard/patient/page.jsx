"use client"

import { useEffect, useState } from "react"
import { PatientSidebar } from "@/components/patient-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Bell, Calendar, Clock, Plus } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export default function PatientDashboard() {
  const [patientData, setPatientData] = useState(null)
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

    // Fetch patient data
    const fetchPatientData = async () => {
      try {
        const response = await fetch("/api/patients/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error("Failed to fetch patient data")
        }

        const data = await response.json()
        setPatientData(data)
      } catch (error) {
        console.error("Error fetching patient data:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load your dashboard. Please try again.",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchPatientData()
  }, [router, toast])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <Clock className="mx-auto h-12 w-12 animate-spin text-teal-600" />
          <h2 className="mt-4 text-lg font-medium">Loading your dashboard...</h2>
        </div>
      </div>
    )
  }

  if (!patientData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-lg font-medium">No data available</h2>
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
        <PatientSidebar />
      </div>
      <div className="flex-1">
        <header className="bg-white shadow-sm border-b">
          <div className="flex h-16 items-center justify-between px-4">
            <h2 className="text-xl font-bold">Patient Dashboard</h2>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
              <Avatar>
                <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
                <AvatarFallback>
                  {patientData.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>
        <main className="p-6">
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Welcome, {patientData.name.split(" ")[0]}</h1>
            <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row gap-3">
              <Link href="/dashboard/patient/book">
                <Button className="w-full sm:w-auto">
                  <Plus className="mr-2 h-4 w-4" />
                  Book New Appointment
                </Button>
              </Link>
              <Link href="/dashboard/patient/book-followup">
                <Button variant="outline" className="w-full sm:w-auto">
                  <Calendar className="mr-2 h-4 w-4" />
                  Book Follow-Up
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Upcoming Appointments</CardTitle>
                <CardDescription>Your scheduled sessions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {patientData.appointments.length > 0 ? (
                    patientData.appointments.map((appointment) => (
                      <div key={appointment.id} className="flex items-start space-x-4 rounded-lg border p-3">
                        <div className="rounded-full bg-teal-100 p-2">
                          <Clock className="h-5 w-5 text-teal-600" />
                        </div>
                        <div className="space-y-1">
                          <p className="font-medium">{appointment.therapistName}</p>
                          <p className="text-sm text-gray-500">
                            {appointment.date} at {appointment.time}
                          </p>
                          <p className="text-sm text-gray-500">{appointment.location}</p>
                          <div className="flex items-center pt-1">
                            <Badge variant={appointment.status === "confirmed" ? "default" : "outline"}>
                              {appointment.status === "confirmed" ? "Confirmed" : "Pending"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-gray-500">No upcoming appointments</p>
                      <Link href="/dashboard/patient/book">
                        <Button variant="link" className="mt-2">
                          Book an appointment
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Your Therapist</CardTitle>
                <CardDescription>Your assigned healthcare provider</CardDescription>
              </CardHeader>
              <CardContent>
                {patientData.assignedTherapist ? (
                  <div className="flex items-start space-x-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={patientData.assignedTherapist.image} alt={patientData.assignedTherapist.name} />
                      <AvatarFallback>
                        {patientData.assignedTherapist.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-2">
                      <div>
                        <h3 className="font-medium">{patientData.assignedTherapist.name}</h3>
                        <p className="text-sm text-gray-500">{patientData.assignedTherapist.specialty}</p>
                      </div>
                      <Link href={`/dashboard/patient/therapist/${patientData.assignedTherapist.id}`}>
                        <Button variant="outline" size="sm">
                          View Profile
                        </Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500">No therapist assigned yet</p>
                    <Link href="/dashboard/patient/book">
                      <Button variant="link" className="mt-2">
                        Book your first appointment
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

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

          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Appointment History</CardTitle>
                <CardDescription>Your past sessions and reviews</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="py-3 text-left font-medium">Therapist</th>
                        <th className="py-3 text-left font-medium">Date & Time</th>
                        <th className="py-3 text-left font-medium">Type</th>
                        <th className="py-3 text-left font-medium">Status</th>
                        <th className="py-3 text-left font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {patientData.pastAppointments.map((appointment) => (
                        <tr key={appointment.id} className="border-b">
                          <td className="py-3">{appointment.therapistName}</td>
                          <td className="py-3">
                            {appointment.date}, {appointment.time}
                          </td>
                          <td className="py-3">{appointment.type}</td>
                          <td className="py-3">
                            <Badge variant="outline">Completed</Badge>
                          </td>
                          <td className="py-3">
                            {!appointment.reviewed ? (
                              <Link href={`/dashboard/patient/reviews/add/${appointment.id}`}>
                                <Button size="sm" variant="outline">
                                  Leave Review
                                </Button>
                              </Link>
                            ) : (
                              <Badge variant="secondary">Reviewed</Badge>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}

