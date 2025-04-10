"use client"

import { useState, useEffect, useCallback } from "react"
import { AdminSidebar } from "@/components/admin-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Bell, Plus, Search, Star, Loader2, Edit, Trash2, Users, Menu, X } from "lucide-react"
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
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import _ from 'lodash'

export default function TherapistsManagement() {
  const [searchQuery, setSearchQuery] = useState("")
  const [therapists, setTherapists] = useState([])
  const [hospitals, setHospitals] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isAddingTherapist, setIsAddingTherapist] = useState(false)
  const [isAddSubmitting, setIsAddSubmitting] = useState(false)
  const [newTherapist, setNewTherapist] = useState({
    name: "",
    email: "",
    hospitalId: "",
    specialty: "",
    phone: "",
  })
  const [editingTherapist, setEditingTherapist] = useState(null)
  const [isEditingTherapist, setIsEditingTherapist] = useState(false)
  const [isEditSubmitting, setIsEditSubmitting] = useState(false)
  const [therapistToDelete, setTherapistToDelete] = useState(null)
  const [isDeletingTherapist, setIsDeletingTherapist] = useState(false)
  const [isDeleteSubmitting, setIsDeleteSubmitting] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const { toast } = useToast()

  const debouncedFetchTherapists = useCallback(
    _.debounce(async (query) => {
      setIsLoading(true)
      setError(null)
      try {
        const url = query ? `/api/admin/therapists?search=${encodeURIComponent(query)}` : "/api/admin/therapists";
        const response = await fetch(url);
        if (!response.ok) {
          let errorMsg = `HTTP error! status: ${response.status}`;
          try { const errData = await response.json(); errorMsg = errData.error || errorMsg; } catch(e) {}
          throw new Error(errorMsg);
        }
        const data = await response.json();
        setTherapists(data);
      } catch (e) {
        console.error("Failed to fetch therapists:", e);
        setError(e.message);
        setTherapists([])
        toast({ variant: "destructive", title: "Error", description: `Could not fetch therapists: ${e.message}` });
      } finally {
        setIsLoading(false);
      }
    }, 500),
    [toast]
  );

  useEffect(() => {
    let isMounted = true;
    const fetchInitialData = async () => {
        setIsLoading(true)
        setError(null)
        try {
            const hospResponse = await fetch("/api/hospitals");
            if (!hospResponse.ok) throw new Error('Failed to fetch hospitals');
            const hospData = await hospResponse.json();
            if (isMounted) setHospitals(hospData);
            
            await debouncedFetchTherapists("");
            
        } catch (e) {
             console.error("Failed to fetch initial data:", e);
             if (isMounted) {
                setError(e.message);
                toast({ variant: "destructive", title: "Error", description: `Could not load page data: ${e.message}` });
             }
        } finally {
        }
    };
    fetchInitialData();
    return () => {
        isMounted = false;
        debouncedFetchTherapists.cancel();
    };
  }, []);

  useEffect(() => {
    debouncedFetchTherapists(searchQuery);
  }, [searchQuery]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value)
  }

  const handleNewTherapistChange = (field, value) => {
    setNewTherapist({
      ...newTherapist,
      [field]: value,
    })
  }

  const handleAddTherapist = async () => {
    if (
      !newTherapist.name ||
      !newTherapist.email ||
      !newTherapist.hospitalId ||
      !newTherapist.specialty
    ) {
      toast({ variant: "destructive", title: "Missing information", description: "Please fill in Name, Email, Hospital, and Specialty." })
      return
    }

    setIsAddSubmitting(true)
    try {
        const response = await fetch("/api/admin/therapists", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newTherapist),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || "Failed to add therapist.");
        }

        toast({
            title: "Therapist Added",
            description: `${result.therapist.name} has been added with a temporary password.`,
        })

        setNewTherapist({
            name: "", email: "", hospitalId: "", specialty: "", phone: "",
        })
        setIsAddingTherapist(false)
        await debouncedFetchTherapists(searchQuery)

    } catch (error) {
        console.error("Add therapist error:", error);
        toast({ variant: "destructive", title: "Error Adding Therapist", description: error.message });
    } finally {
        setIsAddSubmitting(false);
    }
  }

  const openEditDialog = (therapist) => {
    const therapistData = {
        ...therapist,
        hospitalId: therapist.hospitalId?._id || therapist.hospitalId || "" 
    };
    setEditingTherapist(therapistData);
    setIsEditingTherapist(true);
  }

  const handleEditTherapistChange = (field, value) => {
    setEditingTherapist({ ...editingTherapist, [field]: value })
  }

  const handleUpdateTherapist = async () => {
    if (!editingTherapist || !editingTherapist._id) return;
    if (!editingTherapist.name || !editingTherapist.email || !editingTherapist.hospitalId || !editingTherapist.specialty) {
      toast({ variant: "destructive", title: "Missing information", description: "Please fill in Name, Email, Hospital, and Specialty." })
      return
    }
    setIsEditSubmitting(true)
    try {
        const response = await fetch(`/api/admin/therapists/${editingTherapist._id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: editingTherapist.name,
                email: editingTherapist.email,
                hospitalId: editingTherapist.hospitalId,
                specialty: editingTherapist.specialty,
                phone: editingTherapist.phone
            }),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Failed to update therapist.");
        toast({ title: "Therapist Updated", description: result.message });
        setEditingTherapist(null);
        setIsEditingTherapist(false);
        debouncedFetchTherapists(searchQuery);
    } catch (error) {
        console.error("Update therapist error:", error);
        toast({ variant: "destructive", title: "Error Updating Therapist", description: error.message });
    } finally {
        setIsEditSubmitting(false);
    }
  }

  const openDeleteDialog = (therapist) => {
    setTherapistToDelete(therapist);
    setIsDeletingTherapist(true);
  }

  const handleDeleteTherapist = async () => {
    if (!therapistToDelete || !therapistToDelete._id) return;
    setIsDeleteSubmitting(true);
    try {
      const response = await fetch(`/api/admin/therapists/${therapistToDelete._id}`, {
        method: "DELETE",
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to delete therapist.");
      toast({ title: "Therapist Deleted", description: result.message });
      setTherapistToDelete(null);
      setIsDeletingTherapist(false);
      debouncedFetchTherapists(searchQuery);
    } catch (error) {
      console.error("Delete therapist error:", error);
      toast({ variant: "destructive", title: "Error Deleting Therapist", description: error.message });
    } finally {
      setIsDeleteSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className="flex-1 flex flex-col">
        <header className="sticky top-0 z-10 bg-white shadow-sm border-b">
          <div className="flex h-16 items-center justify-between px-4">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsSidebarOpen(true)}>
                <Menu className="h-6 w-6" /><span className="sr-only">Open sidebar</span>
            </Button>
            <div className="md:hidden flex-1"></div>
            <h2 className="text-xl font-bold hidden md:block">Therapist Management</h2>
            <div className="flex items-center gap-4 ml-auto">
              <Button variant="ghost" size="icon"><Bell className="h-5 w-5" /></Button>
              <Avatar><AvatarImage src="/placeholder.svg?height=32&width=32" alt="Admin" /><AvatarFallback>AD</AvatarFallback></Avatar>
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">
          <div className="mb-6 md:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">Therapists</h1>
            <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row gap-2 sm:gap-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="search"
                  placeholder="Search by name or email..."
                  className="pl-8 w-full sm:w-[250px] md:w-[300px]"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>
              <Dialog open={isAddingTherapist} onOpenChange={setIsAddingTherapist}>
                <DialogTrigger asChild>
                  <Button className="w-full sm:w-auto">
                    <Plus className="mr-2 h-4 w-4" /> Add Therapist
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Add New Therapist</DialogTitle>
                    <DialogDescription>
                      Enter the details. A temporary password 'password123' will be set.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="add-name">Full Name <span className="text-red-500">*</span></Label>
                        <Input
                          id="add-name"
                          value={newTherapist.name}
                          onChange={(e) => handleNewTherapistChange("name", e.target.value)}
                          placeholder="Dr. John Smith"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="add-email">Email <span className="text-red-500">*</span></Label>
                        <Input
                          id="add-email"
                          type="email"
                          value={newTherapist.email}
                          onChange={(e) => handleNewTherapistChange("email", e.target.value)}
                          placeholder="therapist@example.com"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="add-hospitalId">Hospital <span className="text-red-500">*</span></Label>
                        <Select 
                            onValueChange={(value) => handleNewTherapistChange("hospitalId", value)}
                            value={newTherapist.hospitalId}
                        >
                            <SelectTrigger>
                            <SelectValue placeholder="Select hospital" />
                            </SelectTrigger>
                            <SelectContent>
                            {hospitals.length > 0 ? (
                                hospitals.map((hospital) => (
                                    <SelectItem key={hospital._id} value={hospital._id}>
                                        {hospital.name}
                                    </SelectItem>
                                ))
                            ) : (
                                <SelectItem value="loading" disabled>Loading hospitals...</SelectItem>
                            )}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="add-specialty">Primary Specialty <span className="text-red-500">*</span></Label>
                        <Input
                            id="add-specialty"
                            value={newTherapist.specialty}
                            onChange={(e) => handleNewTherapistChange("specialty", e.target.value)}
                            placeholder="e.g., Articulation Disorder"
                            required
                        />
                    </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="add-phone">Phone (Optional)</Label>
                        <Input
                            id="add-phone"
                            value={newTherapist.phone}
                            onChange={(e) => handleNewTherapistChange("phone", e.target.value)}
                            placeholder="(555) 123-4567"
                        />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddingTherapist(false)} disabled={isAddSubmitting}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddTherapist} disabled={isAddSubmitting}>
                       {isAddSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Add Therapist
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {isLoading ? (
              <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
              </div>
          ) : error ? (
              <div className="text-center text-red-600 py-12">
                  Error loading therapists: {error}
              </div>
          ) : therapists.length > 0 ? (
            <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {therapists.map((therapist) => (
                <Card key={therapist._id} className="flex flex-col justify-between">
                  <div>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={"/placeholder.svg?height=48&width=48"} alt={therapist.name} />
                            <AvatarFallback>{therapist.name?.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                          </Avatar>
                          <div className="space-y-1">
                            <CardTitle>{therapist.name}</CardTitle>
                            <CardDescription>{therapist.email}</CardDescription>
                            <CardDescription>{therapist.hospitalId?.name || "No hospital assigned"}</CardDescription>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <h4 className="text-sm font-medium mb-1">Specialty</h4>
                        <Badge variant="outline">{therapist.specialty}</Badge>
                      </div>
                      {therapist.phone && (
                        <div>
                            <h4 className="text-sm font-medium mb-1">Phone</h4>
                            <CardDescription>{therapist.phone}</CardDescription>
                        </div>
                      )}
                    </CardContent>
                  </div>
                  <CardFooter className="border-t pt-4 mt-4 flex justify-end gap-2">
                    <Button variant="outline" size="icon" onClick={() => openEditDialog(therapist)}>
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit Therapist</span>
                    </Button>
                     <Button variant="destructive" size="icon" onClick={() => openDeleteDialog(therapist)}>
                        <Trash2 className="h-4 w-4" />
                         <span className="sr-only">Delete Therapist</span>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium">No Therapists Found</h3>
              <p className="mt-2 text-sm text-gray-500">
                {searchQuery ? "Try adjusting your search criteria." : "Add the first therapist using the button above."}
              </p>
            </div>
          )}
        </main>
      </div>

      {editingTherapist && (
        <Dialog open={isEditingTherapist} onOpenChange={setIsEditingTherapist}>
            <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
                <DialogTitle>Edit Therapist: {editingTherapist?.name}</DialogTitle>
                <DialogDescription>Update the therapist's details.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-name">Full Name <span className="text-red-500">*</span></Label>
                      <Input id="edit-name" value={editingTherapist.name || ''} onChange={(e) => handleEditTherapistChange("name", e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-email">Email <span className="text-red-500">*</span></Label>
                      <Input id="edit-email" type="email" value={editingTherapist.email || ''} onChange={(e) => handleEditTherapistChange("email", e.target.value)} required />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="edit-hospitalId">Hospital <span className="text-red-500">*</span></Label>
                        <Select onValueChange={(value) => handleEditTherapistChange("hospitalId", value)} value={editingTherapist.hospitalId || ''}> 
                            <SelectTrigger id="edit-hospitalId"><SelectValue placeholder="Select hospital" /></SelectTrigger>
                            <SelectContent>
                            {hospitals.map((hospital) => (
                                <SelectItem key={hospital._id} value={hospital._id}>{hospital.name}</SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="edit-specialty">Primary Specialty <span className="text-red-500">*</span></Label>
                        <Input id="edit-specialty" value={editingTherapist.specialty || ''} onChange={(e) => handleEditTherapistChange("specialty", e.target.value)} required />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="edit-phone">Phone (Optional)</Label>
                    <Input id="edit-phone" value={editingTherapist.phone || ''} onChange={(e) => handleEditTherapistChange("phone", e.target.value)} />
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditingTherapist(false)} disabled={isEditSubmitting}>Cancel</Button>
                <Button onClick={handleUpdateTherapist} disabled={isEditSubmitting}>
                   {isEditSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Save Changes
                </Button>
            </DialogFooter>
            </DialogContent>
        </Dialog>
      )}

       {therapistToDelete && (
            <AlertDialog open={isDeletingTherapist} onOpenChange={setIsDeletingTherapist}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the therapist 
                        <span className="font-medium">{therapistToDelete.name}</span> and remove their data 
                        from our servers. Patients assigned to this therapist may need to be reassigned.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleteSubmitting}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteTherapist} disabled={isDeleteSubmitting} className="bg-red-600 hover:bg-red-700">
                        {isDeleteSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Delete
                    </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
       )}

    </div>
  )
}

