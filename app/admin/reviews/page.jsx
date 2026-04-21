'use client'

import { useEffect, useState, useMemo } from "react"
import { UnifiedSidebar, HamburgerButton } from "@/components/unified-sidebar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Loader2, Star, Search } from "lucide-react"
import { Input } from "@/components/ui/input"

export default function AdminReviews() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
    fetch("/api/reviews")
      .then(r => r.json())
      .then(data => setReviews(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return reviews.filter(r =>
      r.therapistId?.name?.toLowerCase().includes(q) ||
      r.patientId?.name?.toLowerCase().includes(q) ||
      r.comment?.toLowerCase().includes(q)
    )
  }, [reviews, search])

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <UnifiedSidebar userType="admin" isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className="flex flex-col">
        <header className="sticky top-0 z-10 bg-white shadow-sm border-b">
          <div className="flex h-16 items-center gap-4 px-4">
            <HamburgerButton onClick={() => setIsSidebarOpen(true)} />
            <h2 className="text-lg font-bold">All Reviews</h2>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 max-w-5xl mx-auto w-full">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Patient Reviews</h1>
              <p className="text-gray-500 text-sm mt-1">{reviews.length} total reviews in the system</p>
            </div>
            <div className="relative max-w-xs w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by therapist, patient…"
                className="pl-9"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Summary row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[5,4,3,2,1].slice(0,4).map(star => (
              <Card key={star}>
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-center gap-1 mb-1">
                    <span className="text-xl font-bold">{reviews.filter(r => r.rating === star).length}</span>
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  </div>
                  <p className="text-xs text-gray-500">{star}-star reviews</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Reviews Table */}
          <Card>
            <CardHeader>
              <CardTitle>Review List</CardTitle>
              <CardDescription>All patient feedback sorted by most recent</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {filtered.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <Star className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  <p>No reviews found</p>
                </div>
              ) : (
                <div className="divide-y">
                  {filtered.map((r, i) => (
                    <div key={i} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                        <Avatar className="h-10 w-10 shrink-0">
                          <AvatarFallback className="bg-teal-100 text-teal-700 font-bold text-sm">
                            {r.patientId?.name?.split(' ').map(n => n[0]).join('') || 'P'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="font-semibold text-gray-800">{r.patientId?.name || "Patient"}</span>
                            <span className="text-gray-400 text-sm">→</span>
                            <span className="font-semibold text-teal-700 text-sm">{r.therapistId?.name || "Therapist"}</span>
                            <Badge variant="outline" className="text-xs border-teal-200 text-teal-600">{r.therapistId?.specialty}</Badge>
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            {[1,2,3,4,5].map(s => (
                              <Star key={s} className={`h-3.5 w-3.5 ${s <= r.rating ? "fill-amber-400 text-amber-400" : "text-gray-200"}`} />
                            ))}
                            <span className="text-xs font-bold text-gray-600">{r.rating}/5</span>
                          </div>
                          {r.comment && (
                            <p className="text-sm text-gray-500 italic">"{r.comment}"</p>
                          )}
                          {r.survey && (
                            <div className="flex flex-wrap gap-3 mt-2">
                              {Object.entries(r.survey).map(([k, v]) => v ? (
                                <span key={k} className="text-[11px] font-medium text-gray-400 bg-gray-100 rounded-full px-2 py-0.5 capitalize">
                                  {k}: {v}★
                                </span>
                              ) : null)}
                            </div>
                          )}
                        </div>
                        <span className="text-xs text-gray-400 shrink-0">
                          {new Date(r.createdAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
