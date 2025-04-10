"use client"

import { useState } from "react"
import { PatientSidebar } from "@/components/patient-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export default function BookAppointment() {
  const [step, setStep] = useState(1)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [formData, setFormData] = useState({
    hospital: "",
    issueDescription: "",
    date: undefined,
  })
  const [suggestedTherapist, setSuggestedTherapist] = useState(null)
  const router = useRouter()
  const { toast } = useToast()

  const handleChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    })
  }

  const handleNext = () => {
    if (step === 1) {
      if (!formData.hospital || !formData.issueDescription) {
        toast({
          variant: "destructive",
          title: "Missing information",
          description: "Please fill in all required fields.",
        })
        return
      }
      setStep(2)
    } else if (step === 2) {
      if (!formData.date) {
        toast({
          variant: "destructive",
          title: "Missing information",
          description: "Please select a preferred date.",
        })
        return
      }
      setIsAnalyzing(true)
      // Simulate AI analysis
      setTimeout(() => {
        setIsAnalyzing(false)
        setSuggestedTherapist({
          name: "Dr. Sarah Johnson",
          specialty: "Speech-Language Pathologist",
          experience: "8 years",
          rating: 4.9,
          hospital: "Downtown Medical Center",
          image: "/placeholder.svg?height=80&width=80",
        })
        setStep(3)
      }, 2000)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleConfirm = () => {
    toast({
      title: "Appointment Booked",
      description: "Your appointment has been successfully scheduled.",
    })
    router.push("/patient/dashboard")
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="hidden md:flex md:w-64 md:flex-col">
        <PatientSidebar />
      </div>
      <div className="flex-1">
        <main className="p-6 max-w-4xl mx-auto">
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
                      <SelectItem value="downtown">Downtown Medical Center</SelectItem>
                      <SelectItem value="north">North Valley Hospital</SelectItem>
                      <SelectItem value="east">East Side Clinic</SelectItem>
                      <SelectItem value="west">West End Health Center</SelectItem>
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
                <CardTitle>Step 2: Select preferred date</CardTitle>
                <CardDescription>Choose a date that works best for you</CardDescription>
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
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={handleBack}>
                  Back
                </Button>
                <Button onClick={handleNext}>Continue</Button>
              </CardFooter>
            </Card>
          )}

          {isAnalyzing && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-12 w-12 animate-spin text-teal-600 mb-4" />
                <h3 className="text-lg font-medium">Analyzing your needs...</h3>
                <p className="text-sm text-gray-500 mt-2 text-center max-w-md">
                  Our AI is matching you with the best therapist based on your description and preferences.
                </p>
              </CardContent>
            </Card>
          )}

          {step === 3 && suggestedTherapist && (
            <Card>
              <CardHeader>
                <CardTitle>Step 3: Confirm your appointment</CardTitle>
                <CardDescription>We've found the perfect therapist for your needs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-teal-50 p-4 rounded-lg border border-teal-100">
                  <p className="text-sm text-teal-800 font-medium">
                    Based on your description, we've identified that you may benefit from therapy focusing on:
                  </p>
                  <ul className="list-disc list-inside mt-2 text-sm text-teal-700 space-y-1">
                    <li>Articulation improvement</li>
                    <li>Fluency enhancement</li>
                    <li>Pronunciation exercises</li>
                  </ul>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-start space-x-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={suggestedTherapist.image} alt={suggestedTherapist.name} />
                      <AvatarFallback>SJ</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <h3 className="font-medium text-lg">{suggestedTherapist.name}</h3>
                      <p className="text-sm text-gray-500">{suggestedTherapist.specialty}</p>
                      <div className="flex items-center space-x-2">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <svg
                              key={star}
                              className={`h-4 w-4 fill-current ${
                                star <= Math.floor(suggestedTherapist.rating) ? "text-yellow-500" : "text-gray-300"
                              }`}
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                            >
                              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                            </svg>
                          ))}
                        </div>
                        <span className="text-sm text-gray-500">{suggestedTherapist.rating} (42 reviews)</span>
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline">{suggestedTherapist.experience} experience</Badge>
                        <Badge variant="outline">{suggestedTherapist.hospital}</Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-4 space-y-3">
                  <h3 className="font-medium">Appointment Details</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-gray-500">Date:</div>
                    <div>{format(formData.date, "PPP")}</div>
                    <div className="text-gray-500">Time:</div>
                    <div>10:00 AM (First available)</div>
                    <div className="text-gray-500">Location:</div>
                    <div>{suggestedTherapist.hospital}</div>
                    <div className="text-gray-500">Session Duration:</div>
                    <div>45 minutes</div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={handleBack}>
                  Back
                </Button>
                <Button onClick={handleConfirm}>Confirm Appointment</Button>
              </CardFooter>
            </Card>
          )}
        </main>
      </div>
    </div>
  )
}

