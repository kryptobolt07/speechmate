"use client"

import { useState, useEffect, useCallback } from "react"
import { AdminSidebar } from "@/components/admin-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bell, Search, Shuffle, Loader2, Users, UserCheck } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import _ from 'lodash'

export default function ReassignmentsPage() {
  const [unassignedPatients, setUnassignedPatients] = useState([])
  const [availableTherapists, setAvailableTherapists] = useState([])
  const [selectedPatientId, setSelectedPatientId] = useState(null)
  const [selectedTherapistId, setSelectedTherapistId] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const { toast } = useToast()

  // Fetch initial data (unassigned patients and available therapists)
  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      // TODO: Create a dedicated API route or modify existing ones?
      // For now, fetch separately
      const [patientsRes, therapistsRes] = await Promise.all([
        fetch("/api/admin/reassignments/data?type=patients"), // Hypothetical endpoint
        fetch("/api/admin/reassignments/data?type=therapists") // Hypothetical endpoint
      ]);

      if (!patientsRes.ok) {
         let errorMsg = `HTTP error fetching patients! status: ${patientsRes.status}`;
         try { const errData = await patientsRes.json(); errorMsg = errData.error || errorMsg; } catch(e) {}
         throw new Error(errorMsg);
      }
      if (!therapistsRes.ok) {
         let errorMsg = `HTTP error fetching therapists! status: ${therapistsRes.status}`;
         try { const errData = await therapistsRes.json(); errorMsg = errData.error || errorMsg; } catch(e) {}
         throw new Error(errorMsg);
      }

      const patientsData = await patientsRes.json();
      const therapistsData = await therapistsRes.json();
      
      setUnassignedPatients(patientsData);
      setAvailableTherapists(therapistsData);

    } catch (e) {
      console.error("Failed to fetch reassignment data:", e);
      setError(e.message);
      toast({ variant: "destructive", title: "Error", description: `Could not load data: ${e.message}` });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAssignTherapist = async () => {
    if (!selectedPatientId || !selectedTherapistId) {
      toast({ variant: "destructive", title: "Selection Missing", description: "Please select a patient and a therapist." });
      return;
    }

    setIsSubmitting(true)
    try {
      // TODO: Create this API endpoint
      const response = await fetch("/api/admin/reassignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId: selectedPatientId, therapistId: selectedTherapistId }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to assign therapist.");
      }

      toast({ title: "Therapist Assigned", description: result.message });
      
      // Reset selections and refresh data
      setSelectedPatientId(null);
      setSelectedTherapistId("");
      fetchData(); // Re-fetch to update the list of unassigned patients

    } catch (error) {
      console.error("Assign therapist error:", error);
      toast({ variant: "destructive", title: "Assignment Error", description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="hidden md:flex md:w-64 md:flex-col">
        <AdminSidebar />
      </div>
      <div className="flex-1">
        <header className="bg-white shadow-sm border-b">
          <div className="flex h-16 items-center justify-between px-4">
            <h2 className="text-xl font-bold">Patient Reassignment</h2>
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
          <Card>
            <CardHeader>
              <CardTitle>Assign Therapists to Patients</CardTitle>
              <CardDescription>
                View patients currently without an assigned therapist and assign them to an available one.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
                </div>
              ) : error ? (
                <div className="text-center text-red-600 py-12">
                  Error loading data: {error}
                </div>
              ) : unassignedPatients.length === 0 ? (
                <div className="text-center py-12">
                    <UserCheck className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-4 text-lg font-medium">No Unassigned Patients</h3>
                    <p className="mt-2 text-sm text-gray-500">
                        All patients currently have an assigned therapist.
                    </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Unassigned Patients ({unassignedPatients.length})</h3>
                    <div className="border rounded-md">
                        <Table>
                        <TableHeader>
                            <TableRow>
                            <TableHead className="w-[100px]">Select</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            {/* Add other relevant patient columns if needed */}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {unassignedPatients.map((patient) => (
                            <TableRow 
                                key={patient._id} 
                                className={selectedPatientId === patient._id ? "bg-muted/50" : ""}
                            >
                                <TableCell>
                                    <Button 
                                        variant={selectedPatientId === patient._id ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setSelectedPatientId(patient._id)}
                                    >
                                        {selectedPatientId === patient._id ? "Selected" : "Select"}
                                    </Button>
                                </TableCell>
                                <TableCell className="font-medium">{patient.name}</TableCell>
                                <TableCell>{patient.email}</TableCell>
                            </TableRow>
                            ))}
                        </TableBody>
                        </Table>
                    </div>
                  </div>

                  {selectedPatientId && (
                    <div className="flex flex-col sm:flex-row items-center gap-4 p-4 border rounded-md bg-muted/50">
                       <div className="flex-1">
                            <p className="text-sm font-medium">
                                Assign therapist to: <span className="text-teal-700">{unassignedPatients.find(p => p._id === selectedPatientId)?.name}</span>
                            </p>
                       </div> 
                      <Select onValueChange={setSelectedTherapistId} value={selectedTherapistId}>
                        <SelectTrigger className="w-full sm:w-[300px]">
                          <SelectValue placeholder="Select available therapist..." />
                        </SelectTrigger>
                        <SelectContent>
                          {availableTherapists.length > 0 ? (
                            availableTherapists.map((therapist) => (
                              <SelectItem key={therapist._id} value={therapist._id}>
                                {therapist.name} ({therapist.specialty || 'N/A'} - {therapist.hospitalId?.name || 'N/A'})
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="loading" disabled>No therapists available</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <Button onClick={handleAssignTherapist} disabled={!selectedTherapistId || isSubmitting}>
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Assign Therapist
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}

