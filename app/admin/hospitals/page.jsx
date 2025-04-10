"use client"

import { useState, useEffect } from "react"
import { AdminSidebar } from "@/components/admin-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bell, Building, Edit, MapPin, Plus, Trash2, Users, Loader2 } from "lucide-react"
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
import { useToast } from "@/components/ui/use-toast"

export default function HospitalsManagement() {
  const [hospitals, setHospitals] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isAddingHospital, setIsAddingHospital] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newHospital, setNewHospital] = useState({
    name: "",
    slug: "",
  })
  const { toast } = useToast()

  const fetchHospitals = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/hospitals")
      if (!response.ok) {
        let errorMsg = `HTTP error! status: ${response.status}`;
        try { const errData = await response.json(); errorMsg = errData.error || errorMsg; } catch(e) {}
        throw new Error(errorMsg)
      }
      const data = await response.json()
      setHospitals(data)
    } catch (e) {
      console.error("Failed to fetch hospitals:", e)
      setError(e.message)
      toast({ variant: "destructive", title: "Error", description: `Could not fetch hospitals: ${e.message}` })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchHospitals()
  }, [])

  const handleNewHospitalChange = (field, value) => {
    setNewHospital({
      ...newHospital,
      [field]: value,
    })
  }

  const handleAddHospital = async () => {
    if (!newHospital.name || !newHospital.slug) {
      toast({ variant: "destructive", title: "Missing information", description: "Please provide both a Name and a Slug." })
      return
    }
    
    setIsSubmitting(true)
    try {
      const response = await fetch("/api/hospitals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newHospital),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
          throw new Error(result.error || "Failed to add hospital.");
      }

      toast({
        title: "Hospital Added",
        description: `${result.hospital.name} has been added successfully.`,
      })

      setNewHospital({ name: "", slug: "" })
      setIsAddingHospital(false)
      await fetchHospitals()

    } catch (error) {
        console.error("Add hospital error:", error);
        toast({ variant: "destructive", title: "Error Adding Hospital", description: error.message });
    } finally {
        setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
            <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
            <span className="ml-2">Loading hospitals...</span>
        </div>
    )
  }

  if (error) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
            <p className="text-red-600">Error loading hospitals: {error}</p>
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
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Hospital Name <span className="text-red-500">*</span></Label>
                        <Input
                          id="name"
                          value={newHospital.name}
                          onChange={(e) => handleNewHospitalChange("name", e.target.value)}
                          placeholder="Medical Center Name"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="slug">Slug <span className="text-red-500">*</span></Label>
                        <Input
                          id="slug"
                          value={newHospital.slug}
                          onChange={(e) => handleNewHospitalChange("slug", e.target.value.toLowerCase().trim())}
                          placeholder="unique-hospital-slug"
                          required
                        />
                         <p className="text-xs text-gray-500">Unique identifier (lowercase, no spaces).</p>
                      </div>
                     </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddingHospital(false)} disabled={isSubmitting}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddHospital} disabled={isSubmitting}>
                      {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Add Hospital
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {hospitals.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {hospitals.map((hospital) => (
                  <Card key={hospital._id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-xl">{hospital.name}</CardTitle>
                          <CardDescription>Slug: {hospital.slug}</CardDescription>
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
                            <span className="text-sm">Patients</span>
                          </div>
                          <span className="font-medium">{hospital.patients}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
                 <div className="text-center py-12">
                     <Building className="mx-auto h-12 w-12 text-gray-400" />
                     <h3 className="mt-4 text-lg font-medium">No Hospitals Found</h3>
                     <p className="mt-2 text-sm text-gray-500">Add the first hospital location using the button above.</p>
                 </div>
            )}
        </main>
      </div>
    </div>
  )
}

