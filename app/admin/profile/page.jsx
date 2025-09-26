"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Mail, Phone, Calendar, MapPin, Edit, Save, X, Shield } from "lucide-react"

export default function AdminProfile() {
  const [admin, setAdmin] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  })

  useEffect(() => {
    fetchAdminData()
  }, [])

  const fetchAdminData = async () => {
    try {
      // Mock admin data since we don't have an admin/me endpoint
      const mockAdmin = {
        name: 'Admin User',
        email: 'admin@speechmate.com',
        phone: '+1 (555) 123-4567',
        address: '123 Admin Street, City, State 12345',
        role: 'admin',
        createdAt: new Date().toISOString()
      }
      setAdmin(mockAdmin)
      setFormData({
        name: mockAdmin.name,
        email: mockAdmin.email,
        phone: mockAdmin.phone,
        address: mockAdmin.address
      })
    } catch (error) {
      console.error('Error fetching admin data:', error)
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
      name: admin?.name || '',
      email: admin?.email || '',
      phone: admin?.phone || '',
      address: admin?.address || ''
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
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Profile</h1>
        <p className="text-gray-600">Manage your administrative account information</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Picture and Basic Info */}
        <Card className="md:col-span-1">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <Avatar className="h-24 w-24 mx-auto">
                <AvatarImage src="/placeholder-user.jpg" alt={admin?.name} />
                <AvatarFallback className="text-2xl">
                  {admin?.name?.split(' ').map(n => n[0]).join('') || 'A'}
                </AvatarFallback>
              </Avatar>
            </div>
            <CardTitle className="text-xl">{admin?.name || 'Admin'}</CardTitle>
            <CardDescription className="flex items-center justify-center gap-2">
              <Shield className="h-4 w-4" />
              System Administrator
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-400" />
                <span>{admin?.email || 'No email'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span>Admin since {new Date(admin?.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>Update your administrative account details</CardDescription>
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
                    <span>{admin?.name || 'Not provided'}</span>
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
                    <span>{admin?.email || 'Not provided'}</span>
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
                    <span>{admin?.phone || 'Not provided'}</span>
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
                    <span>{admin?.address || 'Not provided'}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admin Privileges */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Administrative Privileges</CardTitle>
          <CardDescription>Your current administrative access and permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-medium">System Management</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• User account management</li>
                <li>• Hospital and therapist management</li>
                <li>• Appointment oversight and reassignment</li>
                <li>• System analytics and reporting</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Data Access</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• View all patient records</li>
                <li>• Access therapist schedules</li>
                <li>• Monitor appointment status</li>
                <li>• Generate system reports</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
