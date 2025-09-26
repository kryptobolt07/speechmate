"use client"

import { useState, useEffect } from "react"
import { UnifiedSidebar, HamburgerButton } from "@/components/unified-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Input } from "@/components/ui/input"
import { format } from "date-fns"
import { CalendarIcon, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export default function BookAppointment() {
  const [step, setStep] = useState(1)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [formData, setFormData] = useState({
    hospital: "",
    issueDescription: "",
    date: undefined,
  })
  const [classifiedCondition, setClassifiedCondition] = useState(null)
  const [hospitals, setHospitals] = useState([])
  const [availableTherapists, setAvailableTherapists] = useState([])
  const [selectedTherapistId, setSelectedTherapistId] = useState(null)
  const [selectedTime, setSelectedTime] = useState("")
  const [isLoadingCondition, setIsLoadingCondition] = useState(false)
  const [isLoadingTherapists, setIsLoadingTherapists] = useState(false)
  const [isLoadingBooking, setIsLoadingBooking] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const loadHospitals = async () => {
      try {
        const res = await fetch('/api/hospitals')
        if (!res.ok) throw new Error('Failed to fetch hospitals')
        const data = await res.json()
        setHospitals(Array.isArray(data) ? data : [])
      } catch (e) {
        console.error('Hospitals load error', e)
      }
    }
    loadHospitals()
  }, [])

  const handleChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    })
  }

  const handleNext = async () => {
    if (step === 1) {
      if (!formData.hospital || !formData.issueDescription) {
        toast({ variant: "destructive", title: "Missing information", description: "Please select a location and describe your issue." })
        return
      }
      setStep(2)
    } else if (step === 2) {
      if (!formData.date || !selectedTime) {
        toast({ variant: "destructive", title: "Missing information", description: "Please select a preferred date and enter a time." })
        return
      }

      setIsLoadingCondition(true)
      setIsLoadingTherapists(true)
      setStep(3)

      try {
        const formattedDate = format(formData.date, "yyyy-MM-dd")
        const classifyResponse = await fetch("/api/llm/classify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            description: formData.issueDescription,
            hospital: formData.hospital,
            appointmentDate: formattedDate,
            appointmentTime: selectedTime,
          }),
        })
        if (!classifyResponse.ok) {
          throw new Error("Failed to classify condition")
        }
        const classifyData = await classifyResponse.json()
        const { therapistId, therapist, condition } = classifyData
        // Backend returns a single best therapist; render just that one for confirmation
        const singleList = therapist ? [therapist] : []
        setAvailableTherapists(singleList)
        if (therapistId) setSelectedTherapistId(therapistId)
        setClassifiedCondition(condition || null)
        setIsLoadingCondition(false)
        setIsLoadingTherapists(false)
      } catch (error) {
        console.error("Error during step 2->3 transition:", error)
        toast({ variant: "destructive", title: "Error", description: error.message || "Could not find therapists. Please try again." })
        setIsLoadingCondition(false)
        setIsLoadingTherapists(false)
        setStep(2)
      }
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setAvailableTherapists([])
      setClassifiedCondition(null)
      setSelectedTherapistId(null)
      setSelectedTime("")
      setStep(step - 1)
    }
  }

  const handleConfirm = async () => {
    if (!selectedTherapistId || !selectedTime) {
       toast({ variant: "destructive", title: "Missing Information", description: "Please select a therapist and enter a preferred time." })
       return
    }
    
    setIsLoadingBooking(true)
    try {
        const payload = {
            therapistId: selectedTherapistId,
            appointmentDate: format(formData.date, "yyyy-MM-dd"),
            appointmentTime: selectedTime,
            type: "Initial Assessment",
            condition: classifiedCondition,
            notes: formData.issueDescription,
        }
        
        const response = await fetch("/api/appointments/book", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        })
        
        if (!response.ok) {
            // Try to extract useful error details
            let message = 'Booking failed. Please try again.'
            try {
              const text = await response.text()
              try { message = (JSON.parse(text).error) || message } catch { message = text || message }
            } catch {}
            throw new Error(message)
        }

        const result = await response.json()
        
        toast({
            title: "Appointment Booked",
            description: result.message || "Your appointment has been successfully scheduled.",
        })
        router.push("/patient/dashboard")
        
    } catch (error) {
        console.error("Booking confirmation error:", error)
        toast({ variant: "destructive", title: "Booking Error", description: error.message })
    } finally {
        setIsLoadingBooking(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UnifiedSidebar userType="patient" isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <div className="flex flex-col">
        <header className="sticky top-0 z-10 bg-white shadow-sm border-b">
          <div className="flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-4">
              <HamburgerButton onClick={() => setIsSidebarOpen(true)} />
              <h2 className="text-lg font-bold">Book Appointment</h2>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 max-w-4xl mx-auto w-full">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Book New Appointment</h1>
            <p className="text-gray-600 mt-1">Tell us about your needs and we'll match you with the right therapist</p>
          </div>

          <div className="mb-8">
            <div className="flex justify-between mb-8">
              <div className={`h-2 w-1/3 ${step >= 1 ? "bg-teal-500" : "bg-gray-200"} rounded-l-full`}></div>
              <div className={`h-2 w-1/3 ${step >= 2 ? "bg-teal-500" : "bg-gray-200"}`}></div>
              <div className={`h-2 w-1/3 ${step >= 3 ? "bg-teal-500" : "bg-gray-200"} rounded-r-full`}></div>
            </div>
          </div>

          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Step 1: Tell us about your needs</CardTitle>
                <CardDescription>Provide information about your condition and preferred location</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="hospital">Preferred Hospital/Location</Label>
                  <Select onValueChange={(value) => handleChange("hospital", value)} value={formData.hospital}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      {hospitals.map((h) => (
                        <SelectItem key={h._id} value={h.slug}>{h.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="issueDescription">Describe your speech or language issue</Label>
                  <Textarea
                    id="issueDescription"
                    placeholder="Please describe your symptoms, concerns, or what you'd like help with..."
                    rows={5}
                    value={formData.issueDescription}
                    onChange={(e) => handleChange("issueDescription", e.target.value)}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => router.push("/patient/dashboard")}>
                  Cancel
                </Button>
                <Button onClick={handleNext}>Continue</Button>
              </CardFooter>
            </Card>
          )}

          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Step 2: Select preferred date and time</CardTitle>
                <CardDescription>Choose a date and enter a time that works best for you</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Preferred Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.date && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.date ? format(formData.date, "PPP") : "Select a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.date}
                        onSelect={(date) => handleChange("date", date)}
                        initialFocus
                        disabled={(date) =>
                          date < new Date(new Date().setHours(0, 0, 0, 0)) || date.getDay() === 0 || date.getDay() === 6
                        }
                      />
                    </PopoverContent>
                  </Popover>
                  <p className="text-xs text-gray-500 mt-1">Note: Weekends are not available for appointments</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="preferredTime">Preferred Time (e.g., 10:30 AM)</Label>
                  <Input 
                    id="preferredTime"
                    type="text"
                    placeholder="Enter preferred time"
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={handleBack}>
                  Back
                </Button>
                <Button onClick={handleNext} disabled={isLoadingCondition || isLoadingTherapists}>
                  {isLoadingCondition || isLoadingTherapists ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Find Therapists
                </Button>
              </CardFooter>
            </Card>
          )}

          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Step 3: Confirm your appointment</CardTitle>
                <CardDescription>
                  {isLoadingTherapists ? "Finding available therapists..." : "Select a therapist and confirm your appointment."}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {isLoadingTherapists ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <Loader2 className="h-12 w-12 animate-spin text-teal-600 mb-4" />
                        <p className="text-sm text-gray-500 mt-2">Finding available therapists...</p>
                    </div>
                ) : availableTherapists.length > 0 ? (
                  <div>
                    <Label>Select an available therapist:</Label>
                    <RadioGroup 
                        value={selectedTherapistId} 
                        onValueChange={setSelectedTherapistId} 
                        className="mt-2 space-y-3"
                    >
                      {availableTherapists.map((therapist) => (
                        <Label 
                            key={therapist._id} 
                            className="flex items-center space-x-3 border rounded-md p-3 hover:bg-gray-50 cursor-pointer"
                        >
                          <RadioGroupItem value={therapist._id} id={therapist._id} />
                          <Avatar className="h-10 w-10">
                             <AvatarImage src={therapist.profilePictureUrl || "/placeholder.svg?height=40&width=40"} alt={therapist.name} />
                             <AvatarFallback>{therapist.name.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <span className="font-medium block">{therapist.name}</span>
                            <span className="text-sm text-gray-500 block">{therapist.specialty}</span>
                          </div>
                        </Label>
                      ))}
                    </RadioGroup>

                    {/* Time already collected in Step 2 */}
                  </div>
                ) : (
                   <p className="text-center text-gray-500 py-8">
                       No therapists found matching your criteria for the selected date. Please try a different date or broaden your description.
                   </p>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={handleBack} disabled={isLoadingBooking}>
                  Back
                </Button>
                <Button 
                    onClick={handleConfirm} 
                    disabled={isLoadingTherapists || isLoadingBooking || availableTherapists.length === 0}
                >
                  {isLoadingBooking ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Confirm Booking
                </Button>
              </CardFooter>
            </Card>
          )}
        </main>
      </div>
    </div>
  )
}

