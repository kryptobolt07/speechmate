"use client"

import { useState } from "react"
import { AdminSidebar } from "@/components/admin-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bell, Building, Edit, MapPin, Plus, Trash2, Users } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

export default function HospitalsManagement() {
  const [isAddingHospital, setIsAddingHospital] = useState(false)
  const [newHospital, setNewHospital] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    phone: "",
    description: "",
  })
  const { toast } = useToast()

  // Mock data
  const hospitals = [
    {
      id: 1,
      name: "Downtown Medical Center",
      address: "123 Main St, Downtown, CA 90001",
      therapists: 8,
      patients: 412,
      image: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 2,
      name: "North Valley Hospital",
      address: "456 Valley Rd, Northside, CA 90002",
      therapists: 6,
      patients: 287,
      image: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 3,
      name: "East Side Clinic",
      address: "789 East Blvd, Easttown, CA 90003",
      therapists: 5,
      patients: 203,
      image: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 4,
      name: "West End Health Center",
      address: "321 West Ave, Westville, CA 90004",
      therapists: 5,
      patients: 346,
      image: "/placeholder.svg?height=40&width=40",
    },
  ]

  const handleNewHospitalChange = (field, value) => {
    setNewHospital({
      ...newHospital,
      [field]: value,
    })
  }

  const handleAddHospital = () => {
    // Validate form
    if (!newHospital.name || !newHospital.address || !newHospital.city || !newHospital.state || !newHospital.zipCode) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please fill in all required fields.",
      })
      return
    }

    // Simulate API call
    toast({
      title: "Hospital Added",
      description: `${newHospital.name} has been added to the system.`,
    })

    // Reset form and close dialog
    setNewHospital({
      name: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      phone: "",
      description: "",
    })
    setIsAddingHospital(false)
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="hidden md:flex md:w-64 md:flex-col">
        <AdminSidebar />
      </div>
      <div className="flex-1">
        <header className="bg-white shadow-sm border-b">
          <div className="flex h-16 items-center justify-between px-4">
            <h2 className="text-xl font-bold">Hospital Management</h2>
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
            <h1 className="text-2xl font-bold text-gray-900">Hospitals & Locations</h1>
            <div className="mt-4 sm:mt-0">
              <Dialog open={isAddingHospital} onOpenChange={setIsAddingHospital}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Hospital
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Add New Hospital</DialogTitle>
                    <DialogDescription>Enter the details of the new hospital or clinic location.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Hospital Name</Label>
                      <Input
                        id="name"
                        value={newHospital.name}
                        onChange={(e) => handleNewHospitalChange("name", e.target.value)}
                        placeholder="Medical Center Name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Street Address</Label>
                      <Input
                        id="address"
                        value={newHospital.address}
                        onChange={(e) => handleNewHospitalChange("address", e.target.value)}
                        placeholder="123 Main St"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          value={newHospital.city}
                          onChange={(e) => handleNewHospitalChange("city", e.target.value)}
                          placeholder="City"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state">State</Label>
                        <Input
                          id="state"
                          value={newHospital.state}
                          onChange={(e) => handleNewHospitalChange("state", e.target.value)}
                          placeholder="State"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="zipCode">Zip Code</Label>
                        <Input
                          id="zipCode"
                          value={newHospital.zipCode}
                          onChange={(e) => handleNewHospitalChange("zipCode", e.target.value)}
                          placeholder="Zip Code"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={newHospital.phone}
                        onChange={(e) => handleNewHospitalChange("phone", e.target.value)}
                        placeholder="(555) 123-4567"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description (Optional)</Label>
                      <Textarea
                        id="description"
                        value={newHospital.description}
                        onChange={(e) => handleNewHospitalChange("description", e.target.value)}
                        placeholder="Brief description of the facility..."
                        rows={3}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddingHospital(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddHospital}>Add Hospital</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {hospitals.map((hospital) => (
              <Card key={hospital.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-xl">{hospital.name}</CardTitle>
                      <CardDescription className="flex items-start">
                        <MapPin className="h-4 w-4 mr-1 mt-0.5 shrink-0" />
                        <span>{hospital.address}</span>
                      </CardDescription>
                    </div>
                    <Building className="h-8 w-8 text-gray-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="text-sm">Therapists</span>
                      </div>
                      <span className="font-medium">{hospital.therapists}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="text-sm">Active Patients</span>
                      </div>
                      <span className="font-medium">{hospital.patients}</span>
                    </div>
                    <div className="flex justify-between pt-4">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}

