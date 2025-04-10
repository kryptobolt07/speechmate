import { TherapistSidebar } from "@/components/therapist-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Bell, CheckCircle, Clock, FileText } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"

export default function TherapistDashboard() {
  // Mock data
  const todayAppointments = [
    {
      id: 1,
      patient: "John Doe",
      time: "10:00 AM",
      duration: "45 min",
      condition: "Articulation Disorder",
      status: "upcoming",
    },
    {
      id: 2,
      patient: "Emma Wilson",
      time: "11:30 AM",
      duration: "30 min",
      condition: "Stuttering",
      status: "upcoming",
    },
    {
      id: 3,
      patient: "Michael Brown",
      time: "2:00 PM",
      duration: "45 min",
      condition: "Voice Disorder",
      status: "upcoming",
    },
    {
      id: 4,
      patient: "Sophia Garcia",
      time: "3:15 PM",
      duration: "30 min",
      condition: "Language Delay",
      status: "upcoming",
    },
  ]

  const weekAppointments = [
    {
      id: 5,
      patient: "Oliver Taylor",
      date: "Tomorrow",
      time: "9:30 AM",
      condition: "Aphasia",
      status: "upcoming",
    },
    {
      id: 6,
      patient: "Ava Martinez",
      date: "May 12, 2025",
      time: "1:00 PM",
      condition: "Dysarthria",
      status: "upcoming",
    },
    {
      id: 7,
      patient: "William Johnson",
      date: "May 13, 2025",
      time: "11:00 AM",
      condition: "Apraxia",
      status: "upcoming",
    },
  ]

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

          <div className="mt-8">
            <Tabs defaultValue="today">
              <div className="flex items-center justify-between mb-4">
                <TabsList>
                  <TabsTrigger value="today">Today</TabsTrigger>
                  <TabsTrigger value="week">This Week</TabsTrigger>
                  <TabsTrigger value="calendar">Full Calendar</TabsTrigger>
                </TabsList>
                <Link href="/therapist/schedule">
                  <Button variant="outline" size="sm">
                    View Full Schedule
                  </Button>
                </Link>
              </div>

              <TabsContent value="today" className="space-y-4">
                {todayAppointments.map((appointment) => (
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
                ))}
              </TabsContent>

              <TabsContent value="week" className="space-y-4">
                {weekAppointments.map((appointment) => (
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

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Patient Notes</CardTitle>
                <CardDescription>Last updated notes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="rounded-lg border p-3">
                    <div className="flex justify-between">
                      <h3 className="font-medium">John Doe</h3>
                      <span className="text-xs text-gray-500">May 3, 2025</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Patient showing improvement in articulation exercises. Recommended continued practice with 'S'
                      sounds.
                    </p>
                    <Button variant="link" className="px-0 mt-1">
                      View full notes
                    </Button>
                  </div>
                  <div className="rounded-lg border p-3">
                    <div className="flex justify-between">
                      <h3 className="font-medium">Emma Wilson</h3>
                      <span className="text-xs text-gray-500">May 2, 2025</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Stuttering frequency reduced by 30% since last session. Continue with breathing exercises.
                    </p>
                    <Button variant="link" className="px-0 mt-1">
                      View full notes
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upcoming Assessments</CardTitle>
                <CardDescription>New patient evaluations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <h3 className="font-medium">Lucas Anderson</h3>
                      <p className="text-sm text-gray-500">Initial Assessment</p>
                      <p className="text-xs text-gray-500">May 12, 2025 • 9:00 AM</p>
                    </div>
                    <Button size="sm">Prepare</Button>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <h3 className="font-medium">Olivia Parker</h3>
                      <p className="text-sm text-gray-500">Initial Assessment</p>
                      <p className="text-xs text-gray-500">May 14, 2025 • 1:30 PM</p>
                    </div>
                    <Button size="sm">Prepare</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}

