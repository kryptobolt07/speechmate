"use client"

import { useEffect, useState } from "react"
import { AdminSidebar } from "@/components/admin-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Bell, Download, Users } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export default function AdminDashboard() {
  const [summaryData, setSummaryData] = useState(null)
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

    // Fetch admin summary data
    const fetchSummary = async () => {
      try {
        const response = await fetch("/api/admin/summary", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error("Failed to fetch summary data")
        }

        const data = await response.json()
        setSummaryData(data)
      } catch (error) {
        console.error("Error fetching summary data:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load dashboard data. Please try again.",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchSummary()
  }, [router, toast])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="h-12 w-12 mx-auto border-4 border-t-teal-600 border-teal-200 rounded-full animate-spin"></div>
          <h2 className="mt-4 text-lg font-medium">Loading dashboard data...</h2>
        </div>
      </div>
    )
  }

  if (!summaryData) {
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
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Total Therapists</CardTitle>
                <CardDescription>Active healthcare providers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summaryData.stats.totalTherapists}</div>
                <p className="text-xs text-gray-500 mt-1">+{summaryData.stats.newTherapistsThisMonth} this month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Active Patients</CardTitle>
                <CardDescription>Registered patients</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summaryData.stats.activePatients}</div>
                <p className="text-xs text-gray-500 mt-1">+{summaryData.stats.newPatientsThisMonth} this month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Appointments Today</CardTitle>
                <CardDescription>Across all locations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summaryData.stats.appointmentsToday}</div>
                <p className="text-xs text-gray-500 mt-1">{summaryData.stats.completedToday} completed</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Average Rating</CardTitle>
                <CardDescription>From patient reviews</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summaryData.stats.averageRating}</div>
                <p className="text-xs text-gray-500 mt-1">+0.2 since last month</p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <Card className="md:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Today's Appointments</CardTitle>
                    <CardDescription>All sessions across locations</CardDescription>
                  </div>
                  <Link href="/dashboard/admin/appointments">
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
                      {summaryData.recentAppointments.map((appointment) => (
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
                      ))}
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
                  {summaryData.hospitals.map((hospital, index) => (
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
                          style={{ width: `${(hospital.therapists / summaryData.stats.totalTherapists) * 100}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500">{hospital.patients} active patients</p>
                    </div>
                  ))}
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
                  {summaryData.recentReassignments.map((reassignment, index) => (
                    <div key={index} className="rounded-lg border p-3">
                      <div className="flex justify-between">
                        <h3 className="font-medium">Patient: {reassignment.patient}</h3>
                        <span className="text-xs text-gray-500">{reassignment.date}</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Reassigned from <span className="font-medium">{reassignment.fromTherapist}</span> to{" "}
                        <span className="font-medium">{reassignment.toTherapist}</span>
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Reason: {reassignment.reason}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>Common administrative tasks</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Link href="/dashboard/admin/therapists/add">
                    <Button variant="outline" className="w-full justify-start">
                      <Users className="mr-2 h-4 w-4" />
                      Add Therapist
                    </Button>
                  </Link>
                  <Link href="/dashboard/admin/hospitals/add">
                    <Button variant="outline" className="w-full justify-start">
                      <Users className="mr-2 h-4 w-4" />
                      Add Hospital
                    </Button>
                  </Link>
                  <Link href="/dashboard/admin/reassignments">
                    <Button variant="outline" className="w-full justify-start">
                      <Users className="mr-2 h-4 w-4" />
                      Reassign Patient
                    </Button>
                  </Link>
                  <Link href="/dashboard/admin/reports">
                    <Button variant="outline" className="w-full justify-start">
                      <Users className="mr-2 h-4 w-4" />
                      Generate Report
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}

