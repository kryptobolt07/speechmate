"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Mail, Phone, Calendar, MapPin, Edit, Save, X, GraduationCap, Award } from "lucide-react"

export default function TherapistProfile() {
  const [therapist, setTherapist] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialty: '',
    experience: '',
    bio: '',
    address: ''
  })

  useEffect(() => {
    fetchTherapistData()
  }, [])

  const fetchTherapistData = async () => {
    try {
      const response = await fetch('/api/therapists/me/schedule')
      if (!response.ok) {
        throw new Error('Failed to fetch therapist data')
      }
      const data = await response.json()
      setTherapist(data)
      setFormData({
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        specialty: data.specialty || '',
        experience: data.experience || '',
        bio: data.bio || '',
        address: data.address || ''
      })
    } catch (error) {
      console.error('Error fetching therapist data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      // TODO: Implement profile update API
      console.log('Saving profile:', formData)
      setEditing(false)
    } catch (error) {
      console.error('Error saving profile:', error)
    }
  }

  const handleCancel = () => {
    setFormData({
      name: therapist?.name || '',
      email: therapist?.email || '',
      phone: therapist?.phone || '',
      specialty: therapist?.specialty || '',
      experience: therapist?.experience || '',
      bio: therapist?.bio || '',
      address: therapist?.address || ''
    })
    setEditing(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">My Profile</h1>
        <p className="text-gray-600">Manage your professional information and credentials</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Picture and Basic Info */}
        <Card className="md:col-span-1">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <Avatar className="h-24 w-24 mx-auto">
                <AvatarImage src="/placeholder-user.jpg" alt={therapist?.name} />
                <AvatarFallback className="text-2xl">
                  {therapist?.name?.split(' ').map(n => n[0]).join('') || 'T'}
                </AvatarFallback>
              </Avatar>
            </div>
            <CardTitle className="text-xl">{therapist?.name || 'Therapist'}</CardTitle>
            <CardDescription>Speech Language Pathologist</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-400" />
                <span>{therapist?.email || 'No email'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span>Member since {new Date(therapist?.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Professional Information */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Professional Information</CardTitle>
                <CardDescription>Update your professional details and credentials</CardDescription>
              </div>
              {!editing ? (
                <Button variant="outline" onClick={() => setEditing(true)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSave}>
                    <Save className="mr-2 h-4 w-4" />
                    Save
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleCancel}>
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                {editing ? (
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                ) : (
                  <div className="flex items-center gap-2 p-2 border rounded-md bg-gray-50">
                    <User className="h-4 w-4 text-gray-400" />
                    <span>{therapist?.name || 'Not provided'}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                {editing ? (
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                ) : (
                  <div className="flex items-center gap-2 p-2 border rounded-md bg-gray-50">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span>{therapist?.email || 'Not provided'}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                {editing ? (
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                ) : (
                  <div className="flex items-center gap-2 p-2 border rounded-md bg-gray-50">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span>{therapist?.phone || 'Not provided'}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialty">Specialty</Label>
                {editing ? (
                  <Input
                    id="specialty"
                    value={formData.specialty}
                    onChange={(e) => setFormData({...formData, specialty: e.target.value})}
                    placeholder="e.g., Pediatric Speech Therapy"
                  />
                ) : (
                  <div className="flex items-center gap-2 p-2 border rounded-md bg-gray-50">
                    <Award className="h-4 w-4 text-gray-400" />
                    <span>{therapist?.specialty || 'Not specified'}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience">Years of Experience</Label>
                {editing ? (
                  <Input
                    id="experience"
                    type="number"
                    value={formData.experience}
                    onChange={(e) => setFormData({...formData, experience: e.target.value})}
                    placeholder="e.g., 5"
                  />
                ) : (
                  <div className="flex items-center gap-2 p-2 border rounded-md bg-gray-50">
                    <GraduationCap className="h-4 w-4 text-gray-400" />
                    <span>{therapist?.experience ? `${therapist.experience} years` : 'Not specified'}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                {editing ? (
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                  />
                ) : (
                  <div className="flex items-center gap-2 p-2 border rounded-md bg-gray-50">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span>{therapist?.address || 'Not provided'}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="bio">Professional Bio</Label>
                {editing ? (
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    placeholder="Tell us about your experience and approach to speech therapy..."
                    rows={4}
                  />
                ) : (
                  <div className="p-2 border rounded-md bg-gray-50 min-h-[100px]">
                    <span>{therapist?.bio || 'No bio provided'}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Professional Stats */}
      <div className="grid gap-4 md:grid-cols-3 mt-6">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-teal-600">{therapist?.assignedPatients?.length || 0}</div>
            <div className="text-sm text-gray-600">Active Patients</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-teal-600">{therapist?.todayAppointments?.length || 0}</div>
            <div className="text-sm text-gray-600">Today's Appointments</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-teal-600">{therapist?.weekAppointments?.length || 0}</div>
            <div className="text-sm text-gray-600">This Week</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
