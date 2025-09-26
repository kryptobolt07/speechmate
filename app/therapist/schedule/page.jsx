"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, User, Filter, Search, Plus, Bell, CheckCircle, Star, MessageSquare } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { UnifiedSidebar, HamburgerButton } from "@/components/unified-sidebar"

export default function TherapistSchedule() {
  const [scheduleData, setScheduleData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("today")

  useEffect(() => {
    fetchSchedule()
  }, [])

  const fetchSchedule = async () => {
    try {
      const response = await fetch('/api/therapists/me/schedule')
      if (!response.ok) {
        throw new Error('Failed to fetch schedule')
      }
      const data = await response.json()
      setScheduleData(data)
    } catch (error) {
      console.error('Error fetching schedule:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmAppointment = async (appointmentId) => {
    try {
      const response = await fetch(`/api/appointments/${appointmentId}/confirm`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        throw new Error('Failed to confirm appointment')
      }
      
      // Refresh schedule
      await fetchSchedule()
      alert('Appointment confirmed successfully')
    } catch (error) {
      console.error('Error confirming appointment:', error)
      alert('Failed to confirm appointment')
    }
  }

  const handleCompleteSession = async (appointmentId) => {
    try {
      const response = await fetch(`/api/appointments/${appointmentId}/complete`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        throw new Error('Failed to complete session')
      }
      
      // Refresh schedule
      await fetchSchedule()
      alert('Session marked as completed successfully')
    } catch (error) {
      console.error('Error completing session:', error)
      alert('Failed to complete session')
    }
  }

  const handleAddNotes = async (appointmentId) => {
    const notes = prompt('Enter session notes:')
    if (!notes) return
    
    try {
      const response = await fetch(`/api/appointments/${appointmentId}/notes`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          therapistNotes: notes
        }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to add notes')
      }
      
      alert('Notes added successfully')
    } catch (error) {
      console.error('Error adding notes:', error)
      alert('Failed to add notes')
    }
  }

  const handleStartSession = (appointmentId) => {
    // This would typically redirect to a session page or open a session modal
    alert('Starting session... (This would open the session interface)')
  }

  const todayAppointments = scheduleData?.today || []
  const weekAppointments = scheduleData?.week || []
  const upcomingAppointments = scheduleData?.upcoming || []
  const pastAppointments = scheduleData?.past || []

  // All scheduled appointments (future appointments only)
  const allScheduledAppointments = [
    ...todayAppointments.filter(apt => apt.status !== 'completed' && apt.status !== 'cancelled'),
    ...weekAppointments.filter(apt => apt.status !== 'completed' && apt.status !== 'cancelled'),
    ...upcomingAppointments.filter(apt => apt.status !== 'completed' && apt.status !== 'cancelled')
  ]

  const filterAppointments = (appointments) => {
    return appointments.filter(appointment => {
      const matchesSearch = appointment.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           appointment.condition?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === "all" || appointment.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }

  const filteredTodayAppointments = filterAppointments(todayAppointments)
  const filteredWeekAppointments = filterAppointments(weekAppointments)
  const filteredUpcomingAppointments = filterAppointments(upcomingAppointments)
  const filteredAllScheduledAppointments = filterAppointments(allScheduledAppointments)
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (timeString) => {
    return timeString
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading schedule...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UnifiedSidebar userType="therapist" isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <div className="flex flex-col">
        <header className="sticky top-0 z-10 bg-white shadow-sm border-b">
          <div className="flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-4">
              <HamburgerButton onClick={() => setIsSidebarOpen(true)} />
              <h2 className="text-lg font-bold">My Schedule</h2>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="hidden sm:flex">
                <Bell className="h-5 w-5" />
              </Button>
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Therapist" />
                <AvatarFallback className="text-xs">T</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">My Schedule</h1>
            <p className="text-gray-600">Manage your appointments and patient sessions</p>
          </div>

      {/* Search and Filter Controls */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by patient or condition..."
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
            <SelectItem value="no-show">No Show</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Statistics Cards */}
      {scheduleData?.stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Today's Total</p>
                  <p className="text-2xl font-bold text-gray-900">{scheduleData.stats.totalToday}</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed Today</p>
                  <p className="text-2xl font-bold text-green-600">{scheduleData.stats.completedToday}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Upcoming</p>
                  <p className="text-2xl font-bold text-blue-600">{scheduleData.stats.totalUpcoming}</p>
                </div>
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Patients</p>
                  <p className="text-2xl font-bold text-purple-600">{scheduleData.patients?.length || 0}</p>
                </div>
                <User className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Schedule Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="week">This Week</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="all-scheduled">All Scheduled</TabsTrigger>
          <TabsTrigger value="past">Recent Past</TabsTrigger>
        </TabsList>
        
        <TabsContent value="today" className="space-y-4">
          {filteredTodayAppointments.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments today</h3>
                <p className="text-gray-600">You don't have any appointments scheduled for today.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredTodayAppointments.map((appointment) => (
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
                        
                        <div className="flex items-center gap-3 mb-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src="/placeholder-user.jpg" alt={appointment.patient} />
                            <AvatarFallback>
                              {appointment.patient.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {appointment.patient}
                            </h3>
                            <p className="text-sm text-gray-600">Patient</p>
                          </div>
                        </div>
                        
                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>{formatTime(appointment.appointmentTime)}</span>
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
                        {appointment.status === 'confirmed' && (
                          <Button 
                            size="sm"
                            onClick={() => handleStartSession(appointment.id)}
                          >
                            Start Session
                          </Button>
                        )}
                        {appointment.status === 'pending' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleConfirmAppointment(appointment.id)}
                          >
                            Confirm
                          </Button>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleAddNotes(appointment.id)}
                        >
                          Add Notes
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="week" className="space-y-4">
          {filteredWeekAppointments.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments this week</h3>
                <p className="text-gray-600">You don't have any appointments scheduled for this week.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredWeekAppointments.map((appointment) => (
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
                        
                        <div className="flex items-center gap-3 mb-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src="/placeholder-user.jpg" alt={appointment.patient} />
                            <AvatarFallback>
                              {appointment.patient.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {appointment.patient}
                            </h3>
                            <p className="text-sm text-gray-600">Patient</p>
                          </div>
                        </div>
                        
                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(appointment.appointmentDate)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>{formatTime(appointment.appointmentTime)}</span>
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
                        {appointment.status === 'confirmed' && (
                          <Button size="sm">
                            View Details
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          Add Notes
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="upcoming" className="space-y-4">
          {filteredUpcomingAppointments.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming appointments</h3>
                <p className="text-gray-600">You don't have any upcoming appointments scheduled.</p>
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
                        
                        <div className="flex items-center gap-3 mb-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src="/placeholder-user.jpg" alt={appointment.patient} />
                            <AvatarFallback>
                              {appointment.patient.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {appointment.patient}
                            </h3>
                            <p className="text-sm text-gray-600">Patient</p>
                          </div>
                        </div>
                        
                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(appointment.date)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>{formatTime(appointment.time)}</span>
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
                            onClick={() => handleConfirmAppointment(appointment.id)}
                          >
                            Confirm
                          </Button>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleAddNotes(appointment.id)}
                        >
                          Add Notes
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="all-scheduled" className="space-y-4">
          {filteredAllScheduledAppointments.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No scheduled appointments</h3>
                <p className="text-gray-600">You don't have any future appointments scheduled.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredAllScheduledAppointments.map((appointment) => (
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
                        
                        <div className="flex items-center gap-3 mb-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src="/placeholder-user.jpg" alt={appointment.patient} />
                            <AvatarFallback>
                              {appointment.patient.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {appointment.patient}
                            </h3>
                            <p className="text-sm text-gray-600">Patient</p>
                          </div>
                        </div>
                        
                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(appointment.date)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>{formatTime(appointment.time)}</span>
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
                            onClick={() => handleConfirmAppointment(appointment.id)}
                          >
                            Confirm
                          </Button>
                        )}
                        {appointment.status === 'confirmed' && (
                          <Button 
                            size="sm"
                            onClick={() => handleStartSession(appointment.id)}
                          >
                            Start Session
                          </Button>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleAddNotes(appointment.id)}
                        >
                          Add Notes
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
                <p className="text-gray-600">Your recent past appointments will appear here.</p>
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
                        
                        <div className="flex items-center gap-3 mb-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src="/placeholder-user.jpg" alt={appointment.patient} />
                            <AvatarFallback>
                              {appointment.patient.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {appointment.patient}
                            </h3>
                            <p className="text-sm text-gray-600">Patient</p>
                          </div>
                        </div>
                        
                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(appointment.date)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>{formatTime(appointment.time)}</span>
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
                          {appointment.patientFeedback && (
                            <div className="flex items-center gap-2">
                              <Star className="h-4 w-4 text-yellow-400 fill-current" />
                              <span>Patient Rating: {appointment.patientFeedback.rating}/5</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-4 sm:mt-0 sm:ml-4 flex flex-col sm:flex-row gap-2">
                        {appointment.status === 'confirmed' && (
                          <Button 
                            size="sm"
                            onClick={() => handleCompleteSession(appointment.id)}
                          >
                            Complete Session
                          </Button>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleAddNotes(appointment.id)}
                        >
                          Add Notes
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
        </main>
      </div>
    </div>
  )
}
