"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock, User, Plus, Search, Filter, Edit, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

export default function TherapistNotes() {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [patientFilter, setPatientFilter] = useState("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingNote, setEditingNote] = useState(null)
  const [formData, setFormData] = useState({
    patientId: '',
    sessionDate: '',
    sessionTime: '',
    notes: '',
    goals: '',
    progress: ''
  })

  useEffect(() => {
    fetchNotes()
  }, [])

  const fetchNotes = async () => {
    try {
      // Mock notes data for now
      const mockNotes = [
        {
          id: 1,
          patientName: "John Doe",
          sessionDate: "2024-01-15",
          sessionTime: "10:00 AM",
          notes: "Patient showed good progress with 'R' sounds. Practiced with various words and sentences.",
          goals: "Continue working on 'R' sounds, introduce 'S' sounds",
          progress: "Good",
          createdAt: "2024-01-15T10:30:00Z"
        },
        {
          id: 2,
          patientName: "Jane Smith",
          sessionDate: "2024-01-14",
          sessionTime: "2:00 PM",
          notes: "Patient struggled with articulation today. Need to adjust therapy approach.",
          goals: "Focus on basic articulation exercises",
          progress: "Needs Improvement",
          createdAt: "2024-01-14T14:30:00Z"
        }
      ]
      setNotes(mockNotes)
    } catch (error) {
      console.error('Error fetching notes:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.notes?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesPatient = patientFilter === "all" || note.patientId === patientFilter
    return matchesSearch && matchesPatient
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    // TODO: Implement note creation/update API
    console.log('Saving note:', formData)
    setIsDialogOpen(false)
    setFormData({
      patientId: '',
      sessionDate: '',
      sessionTime: '',
      notes: '',
      goals: '',
      progress: ''
    })
  }

  const handleEdit = (note) => {
    setEditingNote(note)
    setFormData({
      patientId: note.patientId || '',
      sessionDate: note.sessionDate || '',
      sessionTime: note.sessionTime || '',
      notes: note.notes || '',
      goals: note.goals || '',
      progress: note.progress || ''
    })
    setIsDialogOpen(true)
  }

  const getProgressColor = (progress) => {
    switch (progress) {
      case 'Excellent': return 'bg-green-100 text-green-800'
      case 'Good': return 'bg-blue-100 text-blue-800'
      case 'Needs Improvement': return 'bg-yellow-100 text-yellow-800'
      case 'Poor': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const uniquePatients = [...new Set(notes.map(note => note.patientName).filter(Boolean))]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading notes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Session Notes</h1>
          <p className="text-gray-600">Manage your therapy session notes and patient progress</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Note
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingNote ? 'Edit Session Note' : 'Add New Session Note'}</DialogTitle>
              <DialogDescription>
                Record details about your therapy session with a patient.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="patientId">Patient</Label>
                    <Select value={formData.patientId} onValueChange={(value) => setFormData({...formData, patientId: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select patient" />
                      </SelectTrigger>
                      <SelectContent>
                        {uniquePatients.map(patient => (
                          <SelectItem key={patient} value={patient}>{patient}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sessionDate">Session Date</Label>
                    <Input
                      id="sessionDate"
                      type="date"
                      value={formData.sessionDate}
                      onChange={(e) => setFormData({...formData, sessionDate: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sessionTime">Session Time</Label>
                  <Input
                    id="sessionTime"
                    type="time"
                    value={formData.sessionTime}
                    onChange={(e) => setFormData({...formData, sessionTime: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Session Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Describe what happened during the session..."
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="goals">Goals for Next Session</Label>
                  <Textarea
                    id="goals"
                    placeholder="What should be focused on in the next session?"
                    value={formData.goals}
                    onChange={(e) => setFormData({...formData, goals: e.target.value})}
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="progress">Progress Assessment</Label>
                  <Select value={formData.progress} onValueChange={(value) => setFormData({...formData, progress: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select progress level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Excellent">Excellent</SelectItem>
                      <SelectItem value="Good">Good</SelectItem>
                      <SelectItem value="Needs Improvement">Needs Improvement</SelectItem>
                      <SelectItem value="Poor">Poor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingNote ? 'Update Note' : 'Add Note'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filter Controls */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search notes by patient or content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={patientFilter} onValueChange={setPatientFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by patient" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Patients</SelectItem>
            {uniquePatients.map(patient => (
              <SelectItem key={patient} value={patient}>{patient}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Notes List */}
      {filteredNotes.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No session notes</h3>
            <p className="text-gray-600">You haven't created any session notes yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredNotes.map((note) => (
            <Card key={note.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">{note.patientName}</h3>
                      <Badge className={getProgressColor(note.progress)}>
                        {note.progress}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(note.sessionDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{note.sessionTime}</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">Session Notes:</h4>
                        <p className="text-gray-700">{note.notes}</p>
                      </div>
                      
                      {note.goals && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-1">Goals for Next Session:</h4>
                          <p className="text-gray-700">{note.goals}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-4 sm:mt-0 sm:ml-4 flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(note)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
