import { PatientSidebar } from "@/components/patient-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Bell, Calendar, Clock, Plus } from "lucide-react"
import Link from "next/link"

export default function PatientDashboard() {
  // Mock data
  const upcomingAppointments = [
    {
      id: 1,
      therapist: "Dr. Sarah Johnson",
      date: "May 15, 2025",
      time: "10:00 AM",
      location: "Downtown Medical Center",
      type: "Speech Therapy",
      status: "confirmed",
    },
    {
      id: 2,
      therapist: "Dr. Michael Chen",
      date: "May 22, 2025",
      time: "2:30 PM",
      location: "North Valley Hospital",
      type: "Follow-up",
      status: "pending",
    },
  ]

  const pastAppointments = [
    {
      id: 3,
      therapist: "Dr. Sarah Johnson",
      date: "April 30, 2025",
      time: "11:00 AM",
      location: "Downtown Medical Center",
      type: "Initial Assessment",
      status: "completed",
      reviewed: false,
    },
    {
      id: 4,
      therapist: "Dr. Sarah Johnson",
      date: "April 15, 2025",
      time: "10:00 AM",
      location: "Downtown Medical Center",
      type: "Speech Therapy",
      status: "completed",
      reviewed: true,
    },
  ]

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
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>
        <main className="p-6">
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Welcome, John</h1>
            <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row gap-3">
              <Link href="/patient/book">
                <Button className="w-full sm:w-auto">
                  <Plus className="mr-2 h-4 w-4" />
                  Book New Appointment
                </Button>
              </Link>
              <Link href="/patient/book-followup">
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
                  {upcomingAppointments.length > 0 ? (
                    upcomingAppointments.map((appointment) => (
                      <div key={appointment.id} className="flex items-start space-x-4 rounded-lg border p-3">
                        <div className="rounded-full bg-teal-100 p-2">
                          <Clock className="h-5 w-5 text-teal-600" />
                        </div>
                        <div className="space-y-1">
                          <p className="font-medium">{appointment.therapist}</p>
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

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Treatment Progress</CardTitle>
                <CardDescription>Your therapy journey</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Articulation</span>
                      <span>70%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-200">
                      <div className="h-2 rounded-full bg-teal-500" style={{ width: "70%" }}></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Fluency</span>
                      <span>45%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-200">
                      <div className="h-2 rounded-full bg-teal-500" style={{ width: "45%" }}></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Vocabulary</span>
                      <span>85%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-200">
                      <div className="h-2 rounded-full bg-teal-500" style={{ width: "85%" }}></div>
                    </div>
                  </div>
                </div>
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
                      {pastAppointments.map((appointment) => (
                        <tr key={appointment.id} className="border-b">
                          <td className="py-3">{appointment.therapist}</td>
                          <td className="py-3">
                            {appointment.date}, {appointment.time}
                          </td>
                          <td className="py-3">{appointment.type}</td>
                          <td className="py-3">
                            <Badge variant="outline">Completed</Badge>
                          </td>
                          <td className="py-3">
                            {!appointment.reviewed ? (
                              <Link href={`/patient/reviews/add/${appointment.id}`}>
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

