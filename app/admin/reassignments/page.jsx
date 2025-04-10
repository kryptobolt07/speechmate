"use client"

import { useState } from "react"
import { AdminSidebar } from "@/components/admin-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bell, Search, Shuffle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

export default function TherapistReassignment() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [newTherapist, setNewTherapist] = useState("")
  const [reason, setReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  // Mock data
  const patients = [
    {
      id: 1,
      name: "John Doe",
      email: "john.doe@example.com",
      currentTherapist: {
        id: 1,
        name: "Dr. Sarah Johnson",
        specialty: "Speech-Language Pathologist",
        image: "/placeholder.svg?height=40&width=40",
      },
      condition: "Articulation Disorder",
      image: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 2,
      name: "Emma Wilson",
      email: "emma.wilson@example.com",
      currentTherapist: {
        id: 2,
        name: "Dr. Michael Chen",
        specialty: "Speech-Language Pathologist",
        image: "/placeholder.svg?height=40&width=40",
      },
      condition: "Stuttering",
      image: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 3,
      name: "Oliver Taylor",
      email: "oliver.taylor@example.com",
      currentTherapist: {
        id: 3,
        name: "Dr. Lisa Rodriguez",
        specialty: "Speech-Language Pathologist",
        image: "/placeholder.svg?height=40&width=40",
      },
      condition: "Aphasia",
      image: "/placeholder.svg?height=40&width=40",
    },
  ]

  const therapists = [
    {
      id: 1,
      name: "Dr. Sarah Johnson",
      specialty: "Speech-Language Pathologist",
      image: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 2,
      name: "Dr. Michael Chen",
      specialty: "Speech-Language Pathologist",
      image: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 3,
      name: "Dr. Lisa Rodriguez",
      specialty: "Speech-Language Pathologist",
      image: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 4,
      name: "Dr. James Wilson",
      specialty: "Speech-Language Pathologist",
      image: "/placeholder.svg?height=40&width=40",
    },
  ]

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value)
  }

  const filteredPatients = patients.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.currentTherapist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.condition.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient)
    setNewTherapist("")
    setReason("")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!selectedPatient || !newTherapist || !reason) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please fill in all required fields.",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Reassignment Complete",
        description: `${selectedPatient.name} has been reassigned to a new therapist.`,
      })

      // Reset form
      setSelectedPatient(null)
      setNewTherapist("")
      setReason("")
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Reassignment failed",
        description: "There was a problem with the reassignment. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="hidden md:flex md:w-64 md:flex-col">
        <AdminSidebar />
      </div>
      <div className="flex-1">
        <header className="bg-white shadow-sm border-b">
          <div className="flex h-16 items-center justify-between px-4">
            <h2 className="text-xl font-bold">Therapist Reassignment</h2>
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
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Reassign Patients</h1>
            <p className="text-gray-600 mt-1">Change a patient's assigned therapist</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Select Patient</CardTitle>
                <CardDescription>Search and select the patient to reassign</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      type="search"
                      placeholder="Search patients..."
                      className="pl-8 w-full"
                      value={searchQuery}
                      onChange={handleSearchChange}
                    />
                  </div>
                  <div className="space-y-2">
                    {filteredPatients.map((patient) => (
                      <div
                        key={patient.id}
                        className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer hover:bg-gray-50 ${
                          selectedPatient?.id === patient.id ? "border-teal-500 bg-teal-50" : ""
                        }`}
                        onClick={() => handlePatientSelect(patient)}
                      >
                        <Avatar>
                          <AvatarImage src={patient.image} alt={patient.name} />
                          <AvatarFallback>
                            {patient.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="font-medium">{patient.name}</div>
                          <div className="text-sm text-gray-500">{patient.email}</div>
                          <div className="text-sm text-gray-500">Condition: {patient.condition}</div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={patient.currentTherapist.image} alt={patient.currentTherapist.name} />
                            <AvatarFallback>
                              {patient.currentTherapist.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="text-xs text-gray-500">Current: {patient.currentTherapist.name}</div>
                        </div>
                      </div>
                    ))}
                    {filteredPatients.length === 0 && (
                      <div className="text-center py-8 text-gray-500">No patients found matching your search</div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Reassignment Details</CardTitle>
                <CardDescription>Select a new therapist and provide a reason</CardDescription>
              </CardHeader>
              <CardContent>
                {selectedPatient ? (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg border mb-4">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={selectedPatient.image} alt={selectedPatient.name} />
                          <AvatarFallback>
                            {selectedPatient.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{selectedPatient.name}</div>
                          <div className="text-sm text-gray-500">
                            Current Therapist: {selectedPatient.currentTherapist.name}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newTherapist">New Therapist</Label>
                      <Select onValueChange={setNewTherapist} value={newTherapist}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select new therapist" />
                        </SelectTrigger>
                        <SelectContent>
                          {therapists
                            .filter((t) => t.id !== selectedPatient.currentTherapist.id)
                            .map((therapist) => (
                              <SelectItem key={therapist.id} value={therapist.id.toString()}>
                                {therapist.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reason">Reason for Reassignment</Label>
                      <Textarea
                        id="reason"
                        placeholder="Explain why this patient is being reassigned..."
                        rows={4}
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        required
                      />
                    </div>
                    <div className="pt-2">
                      <Button type="submit" className="w-full" disabled={isSubmitting || !newTherapist || !reason}>
                        {isSubmitting ? (
                          <>Processing...</>
                        ) : (
                          <>
                            <Shuffle className="mr-2 h-4 w-4" />
                            Complete Reassignment
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Shuffle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-medium text-gray-900">No Patient Selected</h3>
                    <p className="mt-2">Please select a patient from the list to begin the reassignment process.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}

