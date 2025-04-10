"use client"

import { useState } from "react"
import { AdminSidebar } from "@/components/admin-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Bell, Plus, Search, Star } from "lucide-react"
import { Input } from "@/components/ui/input"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"

export default function TherapistsManagement() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddingTherapist, setIsAddingTherapist] = useState(false)
  const [newTherapist, setNewTherapist] = useState({
    name: "",
    email: "",
    hospital: "",
    specializations: [],
    schedule: {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: false,
      sunday: false,
    },
    sendInvite: true,
  })
  const { toast } = useToast()

  // Mock data
  const therapists = [
    {
      id: 1,
      name: "Dr. Sarah Johnson",
      email: "sarah.johnson@speechmate.com",
      hospital: "Downtown Medical Center",
      specializations: ["Articulation", "Fluency", "Voice"],
      patients: 28,
      rating: 4.9,
      image: "/placeholder.svg?height=40&width=40",
      status: "active",
    },
    {
      id: 2,
      name: "Dr. Michael Chen",
      email: "michael.chen@speechmate.com",
      hospital: "North Valley Hospital",
      specializations: ["Language", "Swallowing", "Cognitive"],
      patients: 22,
      rating: 4.7,
      image: "/placeholder.svg?height=40&width=40",
      status: "active",
    },
    {
      id: 3,
      name: "Dr. Lisa Rodriguez",
      email: "lisa.rodriguez@speechmate.com",
      hospital: "East Side Clinic",
      specializations: ["Pediatric", "Developmental", "AAC"],
      patients: 19,
      rating: 4.8,
      image: "/placeholder.svg?height=40&width=40",
      status: "active",
    },
    {
      id: 4,
      name: "Dr. James Wilson",
      email: "james.wilson@speechmate.com",
      hospital: "West End Health Center",
      specializations: ["Adult", "Neurological", "Rehabilitation"],
      patients: 24,
      rating: 4.6,
      image: "/placeholder.svg?height=40&width=40",
      status: "active",
    },
    {
      id: 5,
      name: "Dr. Emily Parker",
      email: "emily.parker@speechmate.com",
      hospital: "Downtown Medical Center",
      specializations: ["Pediatric", "Articulation", "Early Intervention"],
      patients: 18,
      rating: 4.5,
      image: "/placeholder.svg?height=40&width=40",
      status: "on leave",
    },
  ]

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value)
  }

  const filteredTherapists = therapists.filter(
    (therapist) =>
      therapist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      therapist.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      therapist.hospital.toLowerCase().includes(searchQuery.toLowerCase()) ||
      therapist.specializations.some((spec) => spec.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const handleNewTherapistChange = (field, value) => {
    setNewTherapist({
      ...newTherapist,
      [field]: value,
    })
  }

  const handleScheduleChange = (day, checked) => {
    setNewTherapist({
      ...newTherapist,
      schedule: {
        ...newTherapist.schedule,
        [day]: checked,
      },
    })
  }

  const handleSpecializationChange = (specialization, checked) => {
    if (checked) {
      setNewTherapist({
        ...newTherapist,
        specializations: [...newTherapist.specializations, specialization],
      })
    } else {
      setNewTherapist({
        ...newTherapist,
        specializations: newTherapist.specializations.filter((s) => s !== specialization),
      })
    }
  }

  const handleAddTherapist = () => {
    // Validate form
    if (
      !newTherapist.name ||
      !newTherapist.email ||
      !newTherapist.hospital ||
      newTherapist.specializations.length === 0
    ) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please fill in all required fields.",
      })
      return
    }

    // Simulate API call
    toast({
      title: "Therapist Added",
      description: `${newTherapist.name} has been added to the system.`,
    })

    // Reset form and close dialog
    setNewTherapist({
      name: "",
      email: "",
      hospital: "",
      specializations: [],
      schedule: {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: false,
        sunday: false,
      },
      sendInvite: true,
    })
    setIsAddingTherapist(false)
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="hidden md:flex md:w-64 md:flex-col">
        <AdminSidebar />
      </div>
      <div className="flex-1">
        <header className="bg-white shadow-sm border-b">
          <div className="flex h-16 items-center justify-between px-4">
            <h2 className="text-xl font-bold">Therapist Management</h2>
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
            <h1 className="text-2xl font-bold text-gray-900">Therapists</h1>
            <div className="mt-4 sm:mt-0 flex gap-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="search"
                  placeholder="Search therapists..."
                  className="pl-8 w-full sm:w-[300px]"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>
              <Dialog open={isAddingTherapist} onOpenChange={setIsAddingTherapist}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Therapist
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Add New Therapist</DialogTitle>
                    <DialogDescription>
                      Enter the details of the new therapist. They will receive an invitation email if selected.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          value={newTherapist.name}
                          onChange={(e) => handleNewTherapistChange("name", e.target.value)}
                          placeholder="Dr. John Smith"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={newTherapist.email}
                          onChange={(e) => handleNewTherapistChange("email", e.target.value)}
                          placeholder="john.smith@example.com"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hospital">Hospital/Location</Label>
                      <Select
                        onValueChange={(value) => handleNewTherapistChange("hospital", value)}
                        value={newTherapist.hospital}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="downtown">Downtown Medical Center</SelectItem>
                          <SelectItem value="north">North Valley Hospital</SelectItem>
                          <SelectItem value="east">East Side Clinic</SelectItem>
                          <SelectItem value="west">West End Health Center</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Specializations</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          "Articulation",
                          "Fluency",
                          "Voice",
                          "Language",
                          "Swallowing",
                          "Cognitive",
                          "Pediatric",
                          "Adult",
                          "Neurological",
                        ].map((spec) => (
                          <div key={spec} className="flex items-center space-x-2">
                            <Checkbox
                              id={`spec-${spec}`}
                              checked={newTherapist.specializations.includes(spec)}
                              onCheckedChange={(checked) => handleSpecializationChange(spec, checked)}
                            />
                            <label
                              htmlFor={`spec-${spec}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {spec}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Working Days</Label>
                      <div className="grid grid-cols-4 gap-2">
                        {Object.entries({
                          monday: "Monday",
                          tuesday: "Tuesday",
                          wednesday: "Wednesday",
                          thursday: "Thursday",
                          friday: "Friday",
                          saturday: "Saturday",
                          sunday: "Sunday",
                        }).map(([day, label]) => (
                          <div key={day} className="flex items-center space-x-2">
                            <Checkbox
                              id={`day-${day}`}
                              checked={newTherapist.schedule[day]}
                              onCheckedChange={(checked) => handleScheduleChange(day, checked)}
                            />
                            <label
                              htmlFor={`day-${day}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="sendInvite"
                        checked={newTherapist.sendInvite}
                        onCheckedChange={(checked) => handleNewTherapistChange("sendInvite", checked)}
                      />
                      <label
                        htmlFor="sendInvite"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Send invitation email with login credentials
                      </label>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddingTherapist(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddTherapist}>Add Therapist</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Therapists</CardTitle>
              <CardDescription>Manage therapists, their specializations, and assignments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="py-3 text-left font-medium">Therapist</th>
                      <th className="py-3 text-left font-medium">Hospital</th>
                      <th className="py-3 text-left font-medium">Specializations</th>
                      <th className="py-3 text-left font-medium">Patients</th>
                      <th className="py-3 text-left font-medium">Rating</th>
                      <th className="py-3 text-left font-medium">Status</th>
                      <th className="py-3 text-left font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTherapists.map((therapist) => (
                      <tr key={therapist.id} className="border-b">
                        <td className="py-3">
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarImage src={therapist.image} alt={therapist.name} />
                              <AvatarFallback>
                                {therapist.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{therapist.name}</div>
                              <div className="text-gray-500">{therapist.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3">{therapist.hospital}</td>
                        <td className="py-3">
                          <div className="flex flex-wrap gap-1">
                            {therapist.specializations.map((spec, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {spec}
                              </Badge>
                            ))}
                          </div>
                        </td>
                        <td className="py-3">{therapist.patients}</td>
                        <td className="py-3">
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-500 mr-1" />
                            <span>{therapist.rating}</span>
                          </div>
                        </td>
                        <td className="py-3">
                          <Badge
                            variant={therapist.status === "active" ? "default" : "secondary"}
                            className={
                              therapist.status === "on leave" ? "bg-amber-100 text-amber-800 hover:bg-amber-100" : ""
                            }
                          >
                            {therapist.status === "active" ? "Active" : "On Leave"}
                          </Badge>
                        </td>
                        <td className="py-3">
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              Edit
                            </Button>
                            <Button variant="outline" size="sm">
                              View
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}

