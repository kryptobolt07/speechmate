'use client'

import { useEffect, useState, useMemo } from "react"
import { UnifiedSidebar, HamburgerButton } from "@/components/unified-sidebar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Loader2, Star, TrendingUp, Trophy, Medal } from "lucide-react"
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

const TEAL      = 'hsl(173,80%,40%)'
const TEAL_BG   = 'hsla(173,80%,40%,0.15)'
const STAR_COLORS = [
  'hsla(173,80%,40%,0.85)',
  'hsla(173,70%,50%,0.75)',
  'hsla(45,80%,55%,0.8)',
  'hsla(30,90%,55%,0.8)',
  'hsla(0,75%,60%,0.8)',
]

export default function AdminAnalytics() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
    fetch("/api/reviews")
      .then(r => r.json())
      .then(d => setReviews(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false))
  }, [])

  // Leaderboard
  const leaderboard = useMemo(() => {
    const map = {}
    reviews.forEach(r => {
      const id = r.therapistId?._id || String(r.therapistId)
      if (!map[id]) map[id] = { name: r.therapistId?.name || "?", specialty: r.therapistId?.specialty || "", total: 0, count: 0 }
      map[id].total += r.rating
      map[id].count++
    })
    return Object.values(map)
      .map(t => ({ ...t, avg: t.total / t.count }))
      .sort((a, b) => b.avg - a.avg || b.count - a.count)
      .slice(0, 8)
  }, [reviews])

  // Survey averages (radar)
  const radarData = useMemo(() => {
    const keys = ['communication','punctuality','effectiveness','friendliness','professionalism']
    const totals = Object.fromEntries(keys.map(k => [k, 0]))
    let count = 0
    reviews.forEach(r => {
      if (r.survey) { keys.forEach(k => { totals[k] += r.survey[k] || 0 }); count++ }
    })
    return {
      labels: ['Communication','Punctuality','Effectiveness','Friendliness','Professionalism'],
      datasets: [{
        label: 'System Average',
        data: count > 0 ? keys.map(k => (totals[k]/count).toFixed(2)) : keys.map(() => 0),
        backgroundColor: TEAL_BG, borderColor: TEAL, borderWidth: 2,
        pointBackgroundColor: TEAL, pointRadius: 4,
      }]
    }
  }, [reviews])

  // Star distribution (bar)
  const barData = useMemo(() => ({
    labels: ['1★','2★','3★','4★','5★'],
    datasets: [{
      label: 'Reviews',
      data: [1,2,3,4,5].map(s => reviews.filter(r => r.rating === s).length),
      backgroundColor: STAR_COLORS,
      borderRadius: 6,
      borderSkipped: false,
    }]
  }), [reviews])

  // Sentiment doughnut
  const doughnutData = useMemo(() => ({
    labels: ['Positive (4-5★)','Neutral (3★)','Negative (1-2★)'],
    datasets: [{
      data: [
        reviews.filter(r => r.rating >= 4).length,
        reviews.filter(r => r.rating === 3).length,
        reviews.filter(r => r.rating <= 2).length,
      ],
      backgroundColor: [TEAL, 'hsla(45,80%,55%,0.85)', 'hsla(0,75%,60%,0.8)'],
      borderWidth: 0, hoverOffset: 6,
    }]
  }), [reviews])

  // Top 5 bar chart
  const leaderBarData = useMemo(() => ({
    labels: leaderboard.slice(0,5).map(t => t.name.replace('Dr. ','')),
    datasets: [{
      label: 'Avg Rating',
      data: leaderboard.slice(0,5).map(t => t.avg.toFixed(2)),
      backgroundColor: TEAL, borderRadius: 6,
    }]
  }), [leaderboard])

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
    </div>
  )

  const avgRating = reviews.length ? (reviews.reduce((a,b) => a+b.rating,0)/reviews.length).toFixed(1) : "—"
  const medalColors = ['text-amber-500','text-slate-400','text-amber-700']

  const chartBase = { responsive: true, maintainAspectRatio: false }
  const barOpts = { ...chartBase, plugins:{ legend:{display:false} }, scales:{ x:{grid:{display:false},border:{display:false}}, y:{min:0,max:5,border:{display:false},grid:{color:'#f1f5f9'}} } }
  const radarOpts = { ...chartBase, scales:{ r:{min:0,max:5,ticks:{stepSize:1,backdropColor:'transparent',color:'#9ca3af'},grid:{color:'#e5e7eb'},pointLabels:{color:'#374151',font:{size:11}}} }, plugins:{legend:{display:false}} }

  return (
    <div className="min-h-screen bg-gray-50">
      <UnifiedSidebar userType="admin" isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className="flex flex-col">
        <header className="sticky top-0 z-10 bg-white shadow-sm border-b">
          <div className="flex h-16 items-center gap-4 px-4">
            <HamburgerButton onClick={() => setIsSidebarOpen(true)} />
            <h2 className="text-lg font-bold">Analytics</h2>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Review Analytics</h1>
            <p className="text-gray-500 text-sm mt-1">System-wide performance insights from {reviews.length} patient reviews</p>
          </div>

          {/* KPI row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <KPI label="Total Reviews" value={reviews.length} />
            <KPI label="System Avg Rating" value={<span className="flex items-center gap-1">{avgRating}<Star className="h-4 w-4 fill-amber-400 text-amber-400"/></span>} />
            <KPI label="Positive Reviews" value={`${reviews.filter(r=>r.rating>=4).length}`} sub="rated 4-5★" />
            <KPI label="Therapists Reviewed" value={new Set(reviews.map(r => r.therapistId?._id || r.therapistId)).size} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Leaderboard */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-amber-500" />
                  Therapist Leaderboard
                </CardTitle>
                <CardDescription>Ranked by average patient rating</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {leaderboard.map((t, i) => (
                  <div key={i} className={`flex items-center gap-4 p-3 rounded-lg border ${i === 0 ? 'border-amber-200 bg-amber-50' : 'border-gray-100 hover:bg-gray-50'} transition-colors`}>
                    <div className="w-8 text-center shrink-0">
                      {i < 3
                        ? <Medal className={`h-5 w-5 mx-auto ${medalColors[i]}`} />
                        : <span className="text-sm font-bold text-gray-400">#{i+1}</span>
                      }
                    </div>
                    <Avatar className="h-9 w-9 shrink-0">
                      <AvatarFallback className="bg-teal-100 text-teal-700 font-bold text-xs">
                        {t.name.split(' ').map(n => n[0]).join('').slice(0,2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 text-sm truncate">{t.name}</p>
                      <p className="text-xs text-gray-400 truncate">{t.specialty}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="flex items-center gap-1 justify-end">
                        <span className="font-bold text-gray-900">{t.avg.toFixed(1)}</span>
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      </div>
                      <p className="text-xs text-gray-400">{t.count} reviews</p>
                    </div>
                    <div className="w-20 hidden md:block">
                      <div className="h-1.5 bg-gray-100 rounded-full">
                        <div className="h-full bg-teal-500 rounded-full" style={{ width:`${(t.avg/5)*100}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
                {leaderboard.length === 0 && <p className="text-center text-gray-400 py-8">No reviews yet</p>}
              </CardContent>
            </Card>

            {/* Radar */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-teal-600" />
                  Survey Radar
                </CardTitle>
                <CardDescription>System-wide average scores</CardDescription>
              </CardHeader>
              <CardContent style={{ height: 280 }}>
                <Radar data={radarData} options={radarOpts} />
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Star bar */}
            <Card>
              <CardHeader>
                <CardTitle>Rating Distribution</CardTitle>
                <CardDescription>Count of each star rating</CardDescription>
              </CardHeader>
              <CardContent style={{ height: 250 }}>
                <Bar data={barData} options={barOpts} />
              </CardContent>
            </Card>

            {/* Sentiment donut */}
            <Card>
              <CardHeader>
                <CardTitle>Sentiment Split</CardTitle>
                <CardDescription>Positive / Neutral / Negative</CardDescription>
              </CardHeader>
              <CardContent style={{ height: 250 }} className="flex items-center justify-center">
                <Doughnut data={doughnutData} options={{ ...chartBase, plugins:{legend:{position:'bottom',labels:{boxWidth:12,padding:14}}}, cutout:'62%' }} />
              </CardContent>
            </Card>

            {/* Top 5 bar */}
            <Card>
              <CardHeader>
                <CardTitle>Top 5 Therapists</CardTitle>
                <CardDescription>By average rating</CardDescription>
              </CardHeader>
              <CardContent style={{ height: 250 }}>
                <Bar
                  data={leaderBarData}
                  options={{ ...chartBase, indexAxis:'y', plugins:{legend:{display:false}}, scales:{ x:{min:0,max:5,border:{display:false},grid:{color:'#f1f5f9'}}, y:{grid:{display:false},border:{display:false},ticks:{font:{size:10}}} } }}
                />
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}

function KPI({ label, value, sub }) {
  return (
    <Card>
      <CardContent className="pt-5 pb-4">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm font-medium text-gray-500 mt-1">{label}</p>
        {sub && <p className="text-xs text-gray-400">{sub}</p>}
      </CardContent>
    </Card>
  )
}
