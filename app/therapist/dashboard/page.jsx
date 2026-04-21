'use client'

import { useEffect, useState, useMemo, useRef } from "react"
import { UnifiedSidebar, HamburgerButton } from "@/components/unified-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Bell, Clock, FileText, Loader2, Star, TrendingUp, Users, MessageSquare } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement,
  RadialLinearScale, PointElement, LineElement,
  Filler, Tooltip, Legend, ArcElement
} from 'chart.js'
import { Bar, Radar, Doughnut } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale, LinearScale, BarElement,
  RadialLinearScale, PointElement, LineElement,
  Filler, Tooltip, Legend, ArcElement
)

const TEAL = 'hsl(173, 80%, 40%)'
const TEAL_LIGHT = 'hsla(173, 80%, 40%, 0.15)'
const TEAL_LABELS = ['hsla(173,80%,40%,0.9)', 'hsla(173,80%,50%,0.8)', 'hsla(180,70%,45%,0.8)', 'hsla(160,60%,45%,0.8)', 'hsla(190,75%,40%,0.8)']

export default function TherapistDashboard() {
  const [scheduleData, setScheduleData] = useState(null)
  const [therapistInfo, setTherapistInfo] = useState(null)
  const [reviews, setReviews] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    Promise.all([
      fetch("/api/therapists/me/schedule"),
      fetch("/api/reviews")
    ]).then(async ([sRes, rRes]) => {
      if (sRes.ok) {
        const sd = await sRes.json()
        setScheduleData(sd)
        setTherapistInfo(sd.therapist)
      }
      if (rRes.ok) setReviews(await rRes.json())
    }).catch(e => toast({ variant: "destructive", title: "Error", description: e.message }))
      .finally(() => setIsLoading(false))
  }, [])

  // ----- chart data ----
  const avgRating = useMemo(() => {
    if (!reviews.length) return 0
    return (reviews.reduce((a, b) => a + b.rating, 0) / reviews.length).toFixed(1)
  }, [reviews])

  const radarData = useMemo(() => {
    const keys = ['communication', 'punctuality', 'effectiveness', 'friendliness', 'professionalism']
    const labels = ['Communication', 'Punctuality', 'Effectiveness', 'Friendliness', 'Professionalism']
    const totals = Object.fromEntries(keys.map(k => [k, 0]))
    let count = 0
    reviews.forEach(r => {
      if (r.survey) { keys.forEach(k => { totals[k] += r.survey[k] || 0 }); count++ }
    })
    const data = count > 0 ? keys.map(k => (totals[k] / count).toFixed(1)) : keys.map(() => 0)
    return {
      labels,
      datasets: [{
        label: 'Avg Score',
        data,
        backgroundColor: TEAL_LIGHT,
        borderColor: TEAL,
        borderWidth: 2,
        pointBackgroundColor: TEAL,
        pointRadius: 4,
      }]
    }
  }, [reviews])

  const barData = useMemo(() => {
    const counts = [1,2,3,4,5].map(s => reviews.filter(r => r.rating === s).length)
    return {
      labels: ['1★','2★','3★','4★','5★'],
      datasets: [{
        label: 'Number of Reviews',
        data: counts,
        backgroundColor: TEAL_LABELS,
        borderRadius: 6,
        borderSkipped: false,
      }]
    }
  }, [reviews])

  const doughnutData = useMemo(() => {
    const positive = reviews.filter(r => r.rating >= 4).length
    const neutral = reviews.filter(r => r.rating === 3).length
    const negative = reviews.filter(r => r.rating <= 2).length
    return {
      labels: ['Positive (4-5★)', 'Neutral (3★)', 'Negative (1-2★)'],
      datasets: [{
        data: [positive, neutral, negative],
        backgroundColor: ['hsla(173,80%,40%,0.85)', 'hsla(45,80%,55%,0.85)', 'hsla(0,75%,60%,0.8)'],
        borderWidth: 0,
        hoverOffset: 6,
      }]
    }
  }, [reviews])

  if (isLoading) return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      <span className="ml-2 text-gray-600">Loading your dashboard...</span>
    </div>
  )

  const therapistName = therapistInfo?.name || "Therapist"
  const therapistInitials = therapistName.split(" ").map(n => n[0]).join("") || "T"
  const todayApps = scheduleData?.today ?? []
  const weekApps = scheduleData?.week ?? []

  const barOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { callbacks: { title: t => `Rating: ${t[0].label}` } } },
    scales: {
      x: { grid: { display: false }, border: { display: false } },
      y: { grid: { color: '#f1f5f9' }, border: { display: false }, ticks: { stepSize: 1 } }
    }
  }

  const radarOptions = {
    responsive: true, maintainAspectRatio: false,
    scales: { r: { min: 0, max: 5, ticks: { stepSize: 1, backdropColor: 'transparent', color: '#9ca3af' }, grid: { color: '#e5e7eb' }, pointLabels: { color: '#374151', font: { size: 12 } } } },
    plugins: { legend: { display: false } }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UnifiedSidebar userType="therapist" isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <div className="flex flex-col">
        <header className="sticky top-0 z-10 bg-white shadow-sm border-b">
          <div className="flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-4">
              <HamburgerButton onClick={() => setIsSidebarOpen(true)} />
              <h2 className="text-lg font-bold">Therapist Dashboard</h2>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon"><Bell className="h-5 w-5" /></Button>
              <Avatar className="h-8 w-8">
                <AvatarImage src={therapistInfo?.profilePictureUrl} />
                <AvatarFallback className="bg-teal-600 text-white text-xs font-bold">{therapistInitials}</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Welcome, {therapistName}</h1>
            <p className="text-gray-500 text-sm mt-1">Here's your practice overview</p>
          </div>

          {/* Stat cards */}
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-6">
            <StatCard label="Today's Sessions" value={todayApps.length} icon={<Clock className="h-5 w-5 text-teal-600" />} />
            <StatCard label="This Week" value={todayApps.length + weekApps.length} icon={<Users className="h-5 w-5 text-teal-600" />} />
            <StatCard label="Avg. Rating" value={`${avgRating}/5`} icon={<Star className="h-5 w-5 text-amber-500" />} />
            <StatCard label="Total Reviews" value={reviews.length} icon={<MessageSquare className="h-5 w-5 text-teal-600" />} />
          </div>

          <Tabs defaultValue="schedule">
            <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between mb-4 gap-2">
              <TabsList>
                <TabsTrigger value="schedule">My Schedule</TabsTrigger>
                <TabsTrigger value="feedback">Patient Feedback</TabsTrigger>
              </TabsList>
            </div>

            {/* ── Schedule Tab ── */}
            <TabsContent value="schedule" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Today's Appointments</CardTitle>
                    <CardDescription>{new Date().toLocaleDateString("en-IN", { dateStyle: "full" })}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {todayApps.length > 0 ? todayApps.map(app => (
                      <div key={app._id} className="flex items-center gap-4 p-3 rounded-lg border border-gray-100 hover:border-teal-100 hover:bg-teal-50/30 transition-colors">
                        <Avatar>
                          <AvatarFallback className="bg-teal-100 text-teal-700 font-bold text-sm">
                            {app.patientId?.name?.split(' ').map(n => n[0]).join('') || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800">{app.patientId?.name}</p>
                          <p className="text-sm text-gray-500">{app.condition || app.type}</p>
                        </div>
                        <Badge variant="outline" className="border-teal-200 text-teal-700">{app.appointmentTime}</Badge>
                      </div>
                    )) : (
                      <div className="text-center py-10 text-gray-400">
                        <Clock className="h-10 w-10 mx-auto mb-2 opacity-40" />
                        <p>No sessions today</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Upcoming This Week</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {weekApps.slice(0, 5).map((app, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100">
                        <div className="rounded-full bg-teal-100 p-2">
                          <Clock className="h-4 w-4 text-teal-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-800 text-sm">{app.patientId?.name}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(app.appointmentDate).toLocaleDateString("en-IN", { weekday: "short", month: "short", day: "numeric" })} · {app.appointmentTime}
                          </p>
                        </div>
                      </div>
                    ))}
                    {weekApps.length === 0 && <p className="text-center text-gray-400 py-6">No upcoming sessions this week</p>}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* ── Feedback Tab with Chart.js ── */}
            <TabsContent value="feedback" className="space-y-6">
              {reviews.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-16 text-gray-400">
                    <Star className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">No reviews yet</p>
                    <p className="text-sm mt-1">Patient reviews will appear here after completed sessions</p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Radar – Survey Breakdown */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Performance Radar</CardTitle>
                        <CardDescription>Average scores across all survey dimensions</CardDescription>
                      </CardHeader>
                      <CardContent style={{ height: 300 }}>
                        <Radar data={radarData} options={radarOptions} />
                      </CardContent>
                    </Card>

                    {/* Bar – Rating Distribution */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Rating Distribution</CardTitle>
                        <CardDescription>How many patients gave each star rating</CardDescription>
                      </CardHeader>
                      <CardContent style={{ height: 300 }}>
                        <Bar data={barData} options={barOptions} />
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Doughnut – Sentiment */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Sentiment Split</CardTitle>
                        <CardDescription>Positive vs Neutral vs Negative</CardDescription>
                      </CardHeader>
                      <CardContent style={{ height: 260 }} className="flex items-center justify-center">
                        <Doughnut data={doughnutData} options={{ plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, padding: 16 } } }, cutout: '65%', maintainAspectRatio: false, responsive: true }} />
                      </CardContent>
                    </Card>

                    {/* Recent written reviews */}
                    <Card className="lg:col-span-2">
                      <CardHeader>
                        <CardTitle>Recent Patient Comments</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {reviews.filter(r => r.comment).slice(0, 4).map((r, i) => (
                          <div key={i} className="border-l-4 border-teal-400 pl-4 py-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-semibold text-gray-700">{r.patientId?.name || "Patient"}</span>
                              <div className="flex gap-0.5">
                                {[1,2,3,4,5].map(s => <Star key={s} className={`h-3 w-3 ${s <= r.rating ? "fill-amber-400 text-amber-400" : "text-gray-200"}`} />)}
                              </div>
                            </div>
                            <p className="text-sm text-gray-500 italic">"{r.comment}"</p>
                          </div>
                        ))}
                        {reviews.filter(r => r.comment).length === 0 && <p className="text-gray-400 text-sm text-center py-4">No written comments yet</p>}
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}

function StatCard({ label, value, icon }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-2">
          <div className="p-2 bg-teal-50 rounded-lg">{icon}</div>
        </div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500 mt-1">{label}</p>
      </CardContent>
    </Card>
  )
}
