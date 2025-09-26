'use client' // Make this a client component

import { useState, useEffect } from "react" // Import hooks
import { AdminSidebar } from "@/components/admin-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Bell, Download, Users, Loader2, CalendarCheck, CalendarClock, Menu } from "lucide-react"
import Link from "next/link"

// Map API stat names to icons (optional, for cleaner rendering)
const StatIcons = {
    Users: Users,
    CalendarCheck: CalendarCheck,
    CalendarClock: CalendarClock
};

export default function AdminDashboard() {
  // State for summary data, loading, and errors
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false) // State for mobile sidebar

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        // Assumes authentication is handled by cookies/middleware
        const response = await fetch("/api/admin/summary")
        if (!response.ok) {
           let errorMsg = `HTTP error! status: ${response.status}`;
           try { const errData = await response.json(); errorMsg = errData.error || errorMsg; } catch(e) {}
           throw new Error(errorMsg);
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

  // Handle case where summary data is missing
  if (!summary) {
     return (
       <div className="flex min-h-screen items-center justify-center bg-gray-50">
         <p className="text-gray-600">No dashboard data available.</p>
       </div>
     )
  }

  // Prepare data for rendering
  const statsData = summary.stats ?? [];
  const recentAppointments = summary.recentAppointments ?? [];
  const hospitals = summary.hospitals ?? [];
  const recentReassignments = summary.recentReassignments ?? []; // Still mock
  const totalTherapistsForCalc = statsData.find(s => s.name === 'Total Therapists')?.value || 1; // Avoid division by zero

  // Map appointment status to Badge variant
  const getStatusVariant = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'success';
      case 'scheduled': return 'outline';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className="flex-1 flex flex-col">
        <header className="sticky top-0 z-10 bg-white shadow-sm border-b">
          <div className="flex h-16 items-center justify-between px-4">
            <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden" 
                onClick={() => setIsSidebarOpen(true)}
            >
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open sidebar</span>
            </Button>
            
            <h2 className="text-lg font-bold md:text-xl">Admin Dashboard</h2>
            
            <div className="flex items-center gap-2 md:gap-4">
              <Button variant="ghost" size="icon" className="hidden sm:flex">
                <Bell className="h-5 w-5" />
              </Button>
              <Avatar className="h-8 w-8 md:h-10 md:w-10">
                <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Admin" />
                <AvatarFallback className="text-xs md:text-sm">AD</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">
          <div className="mb-6 md:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          </div>

          <div className="grid gap-4 md:gap-6 grid-cols-2 lg:grid-cols-4">
            {statsData.map((stat, index) => {
              const IconComponent = StatIcons[stat.icon] || Users;
              return (
                <Card key={index}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                     <CardTitle className="text-sm font-medium">{stat.name}</CardTitle>
                     <IconComponent className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value ?? 'N/A'}</div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <div className="mt-6 md:mt-8 grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Recent Appointments</CardTitle>
                    <CardDescription>Last 5 booked appointments</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[600px]">
                    <thead>
                      <tr className="border-b">
                        <th className="py-3 text-left font-medium">Patient</th>
                        <th className="py-3 text-left font-medium">Therapist</th>
                        <th className="py-3 text-left font-medium">Date & Time</th>
                        <th className="py-3 text-left font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentAppointments.length > 0 ? (
                        recentAppointments.map((appointment) => (
                          <tr key={appointment.id} className="border-b hover:bg-muted/50">
                            <td className="py-3">{appointment.patientName}</td>
                            <td className="py-3">{appointment.therapistName}</td>
                            <td className="py-3">{appointment.dateTime}</td>
                            <td className="py-3">
                              <Badge variant={getStatusVariant(appointment.status)}>
                                {appointment.status}
                              </Badge>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan="4" className="py-4 text-center text-gray-500">No recent appointments found.</td></tr>
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
                          <span className="text-sm">{hospital.therapistCount} therapists</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-gray-200">
                          <div
                            className="h-2 rounded-full bg-teal-500"
                            style={{ width: `${(hospital.therapistCount / totalTherapistsForCalc) * 100}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500">{hospital.patientCount} active patients</p>
                      </div>
                    ))
                    ) : (
                       <p className="text-center text-gray-500">No hospital data found.</p>
                    )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6 md:mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Recent Reassignments</CardTitle>
                <CardDescription>Showing mock reassignment data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentReassignments.length > 0 ? (
                    recentReassignments.map((reassignment, index) => (
                      <div key={index} className="rounded-lg border p-3">
                        <div className="flex justify-between">
                          <h3 className="font-medium">Patient: {reassignment.patientName}</h3>
                          <span className="text-xs text-gray-500">{new Date(reassignment.date).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          Reassigned from <span className="font-medium">{reassignment.fromTherapist}</span> to{" "}
                          <span className="font-medium">{reassignment.toTherapist}</span>
                        </p>
                      </div>
                    ))
                  ) : (
                     <p className="text-center text-gray-500">No recent reassignments found.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}

