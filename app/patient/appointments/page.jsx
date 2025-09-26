"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, User, Plus, Filter, Search, Star, MessageSquare } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { UnifiedSidebar, HamburgerButton } from "@/components/unified-sidebar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"

export default function PatientAppointments() {
  const [upcomingAppointments, setUpcomingAppointments] = useState([])
  const [pastAppointments, setPastAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false)
  const [rescheduleAppointment, setRescheduleAppointment] = useState(null)
  const [newDate, setNewDate] = useState("")
  const [newTime, setNewTime] = useState("")
  const [isRescheduling, setIsRescheduling] = useState(false)
  const [isCancelOpen, setIsCancelOpen] = useState(false)
  const [cancelAppointment, setCancelAppointment] = useState(null)
  const [cancelReason, setCancelReason] = useState("")
  const [isCancelling, setIsCancelling] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchAppointments()
  }, [])

  const fetchAppointments = async () => {
    try {
      const response = await fetch('/api/patients/me')
      if (!response.ok) {
        throw new Error('Failed to fetch appointments')
      }
      const data = await response.json()
      setUpcomingAppointments(data.upcomingAppointments || [])
      setPastAppointments(data.pastAppointments || [])
    } catch (error) {
      console.error('Error fetching appointments:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch appointments. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  const openRescheduleDialog = (appointment) => {
    setRescheduleAppointment(appointment)
    setNewDate("")
    setNewTime("")
    setIsRescheduleOpen(true)
  }

  const submitReschedule = async () => {
    if (!rescheduleAppointment || !newDate || !newTime) return
    setIsRescheduling(true)
    try {
      const response = await fetch(`/api/appointments/${rescheduleAppointment.id}/reschedule`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentDate: newDate, appointmentTime: newTime, notes: 'Rescheduled by patient' })
      })
      if (!response.ok) throw new Error('Failed to reschedule appointment')
      toast({
        title: "Success",
        description: "Appointment rescheduled successfully.",
      })
      setIsRescheduleOpen(false)
      setRescheduleAppointment(null)
      await fetchAppointments()
    } catch (error) {
      console.error('Error rescheduling appointment:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to reschedule appointment. Please try again.",
      })
    } finally {
      setIsRescheduling(false)
    }
  }

  const openCancelDialog = (appointment) => {
    setCancelAppointment(appointment)
    setCancelReason("")
    setIsCancelOpen(true)
  }

  const submitCancel = async () => {
    if (!cancelAppointment) return
    setIsCancelling(true)
    try {
      const response = await fetch(`/api/appointments/${cancelAppointment.id}/cancel`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: cancelReason || 'No reason provided' })
      })
      if (!response.ok) throw new Error('Failed to cancel appointment')
      toast({
        title: "Success",
        description: "Appointment cancelled successfully.",
      })
      setIsCancelOpen(false)
      setCancelAppointment(null)
      await fetchAppointments()
    } catch (error) {
      console.error('Error cancelling appointment:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to cancel appointment. Please try again.",
      })
    } finally {
      setIsCancelling(false)
    }
  }

  const filterAppointments = (appointments) => {
    return appointments.filter(appointment => {
      const matchesSearch = appointment.therapistName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           appointment.condition?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === "all" || appointment.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }

  const filteredUpcomingAppointments = filterAppointments(upcomingAppointments)
  const filteredPastAppointments = filterAppointments(pastAppointments)

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      case 'no-show': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const canReview = (appointment) => {
    return appointment.status === 'completed' && !appointment.patientFeedback?.rating
  }

  const hasReviewed = (appointment) => {
    return appointment.status === 'completed' && appointment.patientFeedback?.rating
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading appointments...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UnifiedSidebar userType="patient" isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <div className="flex flex-col">
        <header className="sticky top-0 z-10 bg-white shadow-sm border-b">
          <div className="flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-4">
              <HamburgerButton onClick={() => setIsSidebarOpen(true)} />
              <h2 className="text-lg font-bold">My Appointments</h2>
            </div>

            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Patient" />
                <AvatarFallback className="text-xs">P</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">My Appointments</h1>
            <p className="text-gray-600">Manage your therapy appointments and sessions</p>
          </div>

      {/* Search and Filter Controls */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by therapist or condition..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Link href="/patient/book">
          <Button className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Book New
          </Button>
        </Link>
      </div>

      {/* Appointments List */}
      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past Appointments</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming" className="space-y-4">
          {filteredUpcomingAppointments.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming appointments</h3>
                <p className="text-gray-600 mb-4">You don't have any upcoming appointments scheduled.</p>
                <Link href="/patient/book">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Book Your First Appointment
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredUpcomingAppointments.map((appointment) => (
                <Card key={appointment.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <Badge className={getStatusColor(appointment.status)}>
                            {appointment.status}
                          </Badge>
                          <span className="text-sm text-gray-500">{appointment.type}</span>
                        </div>
                        
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {appointment.therapistName}
                        </h3>
                        
                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(appointment.date)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>{appointment.time}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>{appointment.location}</span>
                          </div>
                          {appointment.condition && (
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              <span>Condition: {appointment.condition}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-4 sm:mt-0 sm:ml-4 flex flex-col sm:flex-row gap-2">
                        {appointment.status === 'pending' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => openCancelDialog(appointment)}
                            className="text-red-600 hover:text-red-700"
                          >
                            Cancel
                          </Button>
                        )}
                        {appointment.status === 'confirmed' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => openRescheduleDialog(appointment)}
                          >
                            Reschedule
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="past" className="space-y-4">
          {filteredPastAppointments.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No past appointments</h3>
                <p className="text-gray-600">Your completed appointments will appear here.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredPastAppointments.map((appointment) => (
                <Card key={appointment.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <Badge className={getStatusColor(appointment.status)}>
                            {appointment.status}
                          </Badge>
                          <span className="text-sm text-gray-500">{appointment.type}</span>
                        </div>
                        
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {appointment.therapistName}
                        </h3>
                        
                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(appointment.date)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>{appointment.time}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>{appointment.location}</span>
                          </div>
                          {appointment.condition && (
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              <span>Condition: {appointment.condition}</span>
                            </div>
                          )}
                          {hasReviewed(appointment) && (
                            <div className="flex items-center gap-2">
                              <Star className="h-4 w-4 text-yellow-400 fill-current" />
                              <span>Rated: {appointment.patientFeedback.rating}/5 stars</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-4 sm:mt-0 sm:ml-4 flex flex-col sm:flex-row gap-2">
                        {canReview(appointment) && (
                          <Link href={`/patient/reviews/add/${appointment.id}`}>
                            <Button size="sm" className="w-full sm:w-auto">
                              <Star className="mr-2 h-4 w-4" />
                              Leave Review
                            </Button>
                          </Link>
                        )}
                        {hasReviewed(appointment) && (
                          <Button size="sm" variant="outline" disabled className="w-full sm:w-auto">
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Review Submitted
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
          {/* Reschedule Dialog */}
          <Dialog open={isRescheduleOpen} onOpenChange={setIsRescheduleOpen}>
            <DialogContent className="sm:max-w-[480px]">
              <DialogHeader>
                <DialogTitle>Reschedule Appointment</DialogTitle>
                <DialogDescription>
                  Pick a new date and time for your appointment with {rescheduleAppointment?.therapistName}.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-3">
                <div className="space-y-1">
                  <Label htmlFor="new-date">New Date (YYYY-MM-DD)</Label>
                  <Input id="new-date" value={newDate} onChange={(e) => setNewDate(e.target.value)} placeholder="2025-10-05" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="new-time">New Time (e.g., 10:00 AM)</Label>
                  <Input id="new-time" value={newTime} onChange={(e) => setNewTime(e.target.value)} placeholder="10:00 AM" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsRescheduleOpen(false)} disabled={isRescheduling}>Cancel</Button>
                <Button onClick={submitReschedule} disabled={isRescheduling}>{isRescheduling ? 'Rescheduling...' : 'Confirm'}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Cancel Dialog */}
          <Dialog open={isCancelOpen} onOpenChange={setIsCancelOpen}>
            <DialogContent className="sm:max-w-[480px]">
              <DialogHeader>
                <DialogTitle>Cancel Appointment</DialogTitle>
                <DialogDescription>
                  Provide an optional reason for cancelling your appointment with {cancelAppointment?.therapistName}.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-1">
                <Label htmlFor="cancel-reason">Reason (optional)</Label>
                <Input id="cancel-reason" value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} placeholder="Not feeling well" />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCancelOpen(false)} disabled={isCancelling}>Back</Button>
                <Button onClick={submitCancel} variant="destructive" disabled={isCancelling}>{isCancelling ? 'Cancelling...' : 'Confirm Cancel'}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  )
}
