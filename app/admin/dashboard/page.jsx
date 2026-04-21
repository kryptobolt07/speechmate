'use client'

import { useState, useEffect, useMemo } from "react"
import { UnifiedSidebar, HamburgerButton } from "@/components/unified-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Bell, Trophy, Users, Loader2, Star, CalendarCheck, CalendarClock, Medal } from "lucide-react"
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement,
  RadialLinearScale, PointElement, LineElement,
  Filler, Tooltip, Legend
} from 'chart.js'
import { Bar, Radar } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale, LinearScale, BarElement,
  RadialLinearScale, PointElement, LineElement,
  Filler, Tooltip, Legend
)

const TEAL = 'hsl(173, 80%, 40%)'
const TEAL_ALPHA = 'hsla(173, 80%, 40%, 0.15)'

export default function AdminDashboard() {
  const [summary, setSummary] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/summary"),
      fetch("/api/reviews")
    ]).then(async ([sRes, rRes]) => {
      if (sRes.ok) setSummary(await sRes.json())
      if (rRes.ok) setReviews(await rRes.json())
    }).finally(() => setLoading(false))
  }, [])

  // Leaderboard: group reviews by therapist, compute avg
  const leaderboard = useMemo(() => {
    const map = {}
    reviews.forEach(r => {
      const id = r.therapistId?._id || String(r.therapistId)
      if (!map[id]) map[id] = { name: r.therapistId?.name || "Unknown", specialty: r.therapistId?.specialty || "Therapist", total: 0, count: 0 }
      map[id].total += r.rating
      map[id].count++
    })
    return Object.values(map)
      .map(t => ({ ...t, avg: (t.total / t.count) }))
      .sort((a, b) => b.avg - a.avg || b.count - a.count)
      .slice(0, 10)
  }, [reviews])

  // System-wide survey averages for radar
  const systemRadarData = useMemo(() => {
    const keys = ['communication', 'punctuality', 'effectiveness', 'friendliness', 'professionalism']
    const totals = Object.fromEntries(keys.map(k => [k, 0]))
    let count = 0
    reviews.forEach(r => {
      if (r.survey) { keys.forEach(k => { totals[k] += r.survey[k] || 0 }); count++ }
    })
    const data = count > 0 ? keys.map(k => (totals[k] / count).toFixed(2)) : keys.map(() => 0)
    return {
      labels: ['Communication', 'Punctuality', 'Effectiveness', 'Friendliness', 'Professionalism'],
      datasets: [{
        label: 'System Average',
        data,
        backgroundColor: TEAL_ALPHA,
        borderColor: TEAL,
        borderWidth: 2,
        pointBackgroundColor: TEAL,
        pointRadius: 4,
      }]
    }
  }, [reviews])

  // Bar chart: top 5 therapists avg rating
  const top5BarData = useMemo(() => {
    const top5 = leaderboard.slice(0, 5)
    return {
      labels: top5.map(t => t.name.replace('Dr. ', 'Dr.')),
      datasets: [{
        label: 'Avg Rating',
        data: top5.map(t => t.avg.toFixed(2)),
        backgroundColor: 'hsla(173, 80%, 40%, 0.8)',
        borderRadius: 6,
        borderSkipped: false,
      }]
    }
  }, [leaderboard])

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      <span className="ml-2 text-gray-600">Loading admin dashboard...</span>
    </div>
  )

  const statsData = summary?.stats ?? []
  const recentAppointments = summary?.recentAppointments ?? []
  const hospitals = summary?.hospitals ?? []
  const totalTherapists = statsData.find(s => s.name === 'Total Therapists')?.value || 1
  const overallAvg = reviews.length ? (reviews.reduce((a, b) => a + b.rating, 0) / reviews.length).toFixed(1) : "—"

  const barOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, border: { display: false }, ticks: { font: { size: 11 } } },
      y: { min: 0, max: 5, grid: { color: '#f1f5f9' }, border: { display: false }, ticks: { stepSize: 1 } }
    }
  }

  const radarOptions = {
    responsive: true, maintainAspectRatio: false,
    scales: { r: { min: 0, max: 5, ticks: { stepSize: 1, backdropColor: 'transparent', color: '#9ca3af' }, grid: { color: '#e5e7eb' }, pointLabels: { color: '#374151', font: { size: 12 } } } },
    plugins: { legend: { display: false } }
  }

  const medalColors = ['text-amber-500', 'text-slate-400', 'text-amber-700', 'text-gray-500', 'text-gray-500']

  return (
    <div className="min-h-screen bg-gray-50">
      <UnifiedSidebar userType="admin" isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <div className="flex flex-col">
        <header className="sticky top-0 z-10 bg-white shadow-sm border-b">
          <div className="flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-4">
              <HamburgerButton onClick={() => setIsSidebarOpen(true)} />
              <h2 className="text-lg font-bold">Admin Dashboard</h2>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon"><Bell className="h-5 w-5" /></Button>
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-teal-600 text-white text-xs font-bold">AD</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
            <p className="text-gray-500 text-sm mt-1">System-wide performance and therapist rankings</p>
          </div>

          {/* Stat cards */}
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-8">
            {statsData.map((s, i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                  <p className="text-sm text-gray-500 mt-1">{s.name}</p>
                </CardContent>
              </Card>
            ))}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-1">
                  <p className="text-2xl font-bold text-gray-900">{overallAvg}</p>
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400 mt-1" />
                </div>
                <p className="text-sm text-gray-500 mt-1">System Avg Rating</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

            {/* ── Leaderboard ── */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-amber-500" />
                  Therapist Leaderboard
                </CardTitle>
                <CardDescription>Ranked by average patient rating · {reviews.length} total reviews</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {leaderboard.length === 0 && <p className="text-center text-gray-400 py-8">No reviews yet</p>}
                  {leaderboard.map((t, i) => (
                    <div key={i} className={`flex items-center gap-4 p-3 rounded-lg border transition-colors ${i === 0 ? "border-amber-200 bg-amber-50" : "border-gray-100 hover:border-teal-100 hover:bg-teal-50/30"}`}>
                      <div className="w-8 text-center">
                        {i < 3
                          ? <Medal className={`h-5 w-5 mx-auto ${medalColors[i]}`} />
                          : <span className="text-sm font-bold text-gray-400">#{i + 1}</span>
                        }
                      </div>
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className={`text-sm font-bold ${i === 0 ? "bg-amber-100 text-amber-700" : "bg-teal-100 text-teal-700"}`}>
                          {t.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800 text-sm">{t.name}</p>
                        <p className="text-xs text-gray-500">{t.specialty}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-gray-900">{t.avg.toFixed(1)}</span>
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        </div>
                        <p className="text-xs text-gray-400">{t.count} review{t.count !== 1 ? "s" : ""}</p>
                      </div>
                      {/* Rating bar */}
                      <div className="w-24 hidden md:block">
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-teal-500 rounded-full transition-all" style={{ width: `${(t.avg / 5) * 100}%` }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* System Radar */}
            <Card>
              <CardHeader>
                <CardTitle>System-wide Survey</CardTitle>
                <CardDescription>Average scores across all therapists</CardDescription>
              </CardHeader>
              <CardContent style={{ height: 300 }}>
                <Radar data={systemRadarData} options={radarOptions} />
              </CardContent>
            </Card>
          </div>

          {/* Top 5 Bar */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Top 5 Therapists – Avg Rating</CardTitle>
                <CardDescription>Chart.js bar comparison</CardDescription>
              </CardHeader>
              <CardContent style={{ height: 280 }}>
                <Bar data={top5BarData} options={barOptions} />
              </CardContent>
            </Card>

            {/* Recent Appointments table */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Appointments</CardTitle>
                <CardDescription>Last 5 booked sessions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-gray-500">
                        <th className="pb-3 text-left font-medium">Patient</th>
                        <th className="pb-3 text-left font-medium">Therapist</th>
                        <th className="pb-3 text-left font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {recentAppointments.length > 0 ? recentAppointments.map((a, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="py-2.5 font-medium text-gray-800">{a.patientName}</td>
                          <td className="py-2.5 text-gray-600">{a.therapistName}</td>
                          <td className="py-2.5">
                            <Badge variant={a.status === "completed" ? "default" : a.status === "cancelled" ? "destructive" : "outline"} className={a.status === "completed" ? "bg-teal-600" : ""}>
                              {a.status}
                            </Badge>
                          </td>
                        </tr>
                      )) : (
                        <tr><td colSpan={3} className="text-center text-gray-400 py-8">No recent appointments</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Hospital Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Therapist Distribution by Hospital</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {hospitals.map((h, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-700 truncate">{h.name}</span>
                      <span className="text-gray-500 shrink-0 ml-2">{h.therapistCount} therapists</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-100">
                      <div className="h-2 rounded-full bg-teal-500 transition-all" style={{ width: `${Math.min((h.therapistCount / totalTherapists) * 100, 100)}%` }} />
                    </div>
                    <p className="text-xs text-gray-400">{h.patientCount} patients enrolled</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
