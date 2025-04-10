'use client' // Make this a client component

import { useState, useEffect } from "react" // Import hooks
import { AdminSidebar } from "@/components/admin-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Bell, Download, Users, Loader2 } from "lucide-react"
import Link from "next/link"

export default function AdminDashboard() {
  // State for summary data, loading, and errors
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        // TODO: Add authentication headers if needed
        const response = await fetch("/api/admin/summary")
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        setSummary(data)
      } catch (e) {
        console.error("Failed to fetch admin summary:", e)
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, []) // Empty dependency array ensures this runs only once on mount

  // Handle Loading State
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        <span className="ml-2">Loading dashboard...</span>
      </div>
    )
  }

  // Handle Error State
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-red-600">Error loading dashboard: {error}</p>
      </div>
    )
  }

  // Handle case where summary data is missing (shouldn't happen if no error)
  if (!summary) {
     return (
       <div className="flex min-h-screen items-center justify-center bg-gray-50">
         <p className="text-gray-600">No dashboard data available.</p>
       </div>
     )
  }

  // Extract data for easier use (using optional chaining for safety)
  const statsData = [
      { title: "Total Therapists", value: summary.stats?.totalTherapists ?? 'N/A', description: "Active therapists", change: `+${summary.stats?.newTherapistsThisMonth ?? 'N/A'} this month` },
      { title: "Active Patients", value: summary.stats?.activePatients?.toLocaleString() ?? 'N/A', description: "Registered patients", change: `+${summary.stats?.newPatientsThisMonth ?? 'N/A'} this month` },
      { title: "Appointments Today", value: summary.stats?.appointmentsToday ?? 'N/A', description: "Across all locations", change: `${summary.stats?.completedToday ?? 'N/A'} completed` },
      { title: "Average Rating", value: summary.stats?.averageRating ?? 'N/A', description: "From patient reviews", change: "" }, // No change data in mock
  ];
  const recentAppointments = summary.recentAppointments ?? [];
  const hospitals = summary.hospitals ?? [];
  const totalTherapistsForCalc = summary.stats?.totalTherapists || 1; // Avoid division by zero

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="hidden md:flex md:w-64 md:flex-col">
        <AdminSidebar />
      </div>
      <div className="flex-1">
        <header className="bg-white shadow-sm border-b">
          <div className="flex h-16 items-center justify-between px-4">
            <h2 className="text-xl font-bold">Admin Dashboard</h2>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
              <Avatar>
                <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Admin" />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>
        <main className="p-6">
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
            <div className="mt-4 sm:mt-0 flex gap-3">
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export Report
              </Button>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {statsData.map((stat, index) => (
              <Card key={index}>
                <CardHeader className="pb-2">
                  <CardTitle>{stat.title}</CardTitle>
                  <CardDescription>{stat.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <Card className="md:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Today's Appointments</CardTitle>
                    <CardDescription>All sessions across locations</CardDescription>
                  </div>
                  <Link href="/admin/appointments">
                    <Button variant="outline" size="sm">
                      View All
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="py-3 text-left font-medium">Patient</th>
                        <th className="py-3 text-left font-medium">Therapist</th>
                        <th className="py-3 text-left font-medium">Time</th>
                        <th className="py-3 text-left font-medium">Location</th>
                        <th className="py-3 text-left font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentAppointments.length > 0 ? (
                        recentAppointments.map((appointment) => (
                          <tr key={appointment.id} className="border-b">
                            <td className="py-3">{appointment.patient}</td>
                            <td className="py-3">{appointment.therapist}</td>
                            <td className="py-3">{appointment.time}</td>
                            <td className="py-3">{appointment.hospital}</td>
                            <td className="py-3">
                              <Badge
                                variant={
                                  appointment.status === "completed"
                                    ? "success"
                                    : appointment.status === "in progress"
                                      ? "default"
                                      : "outline"
                                }
                              >
                                {appointment.status === "completed"
                                  ? "Completed"
                                  : appointment.status === "in progress"
                                    ? "In Progress"
                                    : "Upcoming"}
                              </Badge>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan="5" className="py-4 text-center text-gray-500">No recent appointments found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Therapist Distribution</CardTitle>
                <CardDescription>By hospital location</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {hospitals.length > 0 ? (
                    hospitals.map((hospital, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-2 text-gray-500" />
                            <span className="text-sm font-medium">{hospital.name}</span>
                          </div>
                          <span className="text-sm">{hospital.therapists} therapists</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-gray-200">
                          <div
                            className="h-2 rounded-full bg-teal-500"
                            style={{ width: `${(hospital.therapists / totalTherapistsForCalc) * 100}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500">{hospital.patients} active patients</p>
                      </div>
                    ))
                    ) : (
                       <p className="text-center text-gray-500">No hospital data found.</p>
                    )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Reassignments</CardTitle>
                <CardDescription>Therapist changes in the last 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {summary.recentReassignments?.length > 0 ? (
                    summary.recentReassignments.map((reassignment, index) => (
                      <div key={index} className="rounded-lg border p-3">
                        <div className="flex justify-between">
                          <h3 className="font-medium">Patient: {reassignment.patient}</h3>
                          <span className="text-xs text-gray-500">{new Date(reassignment.date).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          Reassigned from <span className="font-medium">{reassignment.fromTherapist}</span> to{" "}
                          <span className="font-medium">{reassignment.toTherapist}</span>
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Reason: {reassignment.reason}
                        </p>
                      </div>
                    ))
                  ) : (
                     <p className="text-center text-gray-500">No recent reassignments found.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Reviews</CardTitle>
                <CardDescription>Latest patient feedback</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="rounded-lg border p-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center">
                        <Avatar className="h-8 w-8 mr-2">
                          <AvatarImage src="/placeholder.svg?height=32&width=32" alt="John Doe" />
                          <AvatarFallback>JD</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium">John Doe</h3>
                          <p className="text-xs text-gray-500">For Dr. Sarah Johnson</p>
                        </div>
                      </div>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            className="h-4 w-4 fill-current text-yellow-500"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                    <p className="text-sm mt-2">
                      "Dr. Johnson has been incredibly helpful with my speech therapy. I've seen significant improvement
                      in just a few sessions."
                    </p>
                    <p className="text-xs text-gray-500 mt-1">May 7, 2025</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center">
                        <Avatar className="h-8 w-8 mr-2">
                          <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Emma Wilson" />
                          <AvatarFallback>EW</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium">Emma Wilson</h3>
                          <p className="text-xs text-gray-500">For Dr. Michael Chen</p>
                        </div>
                      </div>
                      <div className="flex">
                        {[1, 2, 3, 4].map((star) => (
                          <svg
                            key={star}
                            className="h-4 w-4 fill-current text-yellow-500"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                          </svg>
                        ))}
                        <svg
                          className="h-4 w-4 fill-current text-gray-300"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                        </svg>
                      </div>
                    </div>
                    <p className="text-sm mt-2">
                      "Dr. Chen is very knowledgeable and patient. The exercises he recommended have been very
                      effective."
                    </p>
                    <p className="text-xs text-gray-500 mt-1">May 5, 2025</p>
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

