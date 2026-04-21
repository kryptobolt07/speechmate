'use client'

import { useEffect, useState, useMemo } from "react"
import { UnifiedSidebar, HamburgerButton } from "@/components/unified-sidebar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Loader2, Star, TrendingUp, MessageSquare } from "lucide-react"
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

const TEAL    = 'hsl(173,80%,40%)'
const TEAL_BG = 'hsla(173,80%,40%,0.15)'

export default function TherapistReviews() {
  const [reviews, setReviews]       = useState([])
  const [loading, setLoading]       = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
    fetch("/api/reviews")
      .then(r => r.json())
      .then(d => setReviews(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false))
  }, [])

  const avgRating = useMemo(() => {
    if (!reviews.length) return 0
    return (reviews.reduce((a,b) => a+b.rating, 0) / reviews.length).toFixed(1)
  }, [reviews])

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
        label: 'Your Average',
        data: count > 0 ? keys.map(k => (totals[k]/count).toFixed(2)) : keys.map(() => 0),
        backgroundColor: TEAL_BG, borderColor: TEAL, borderWidth: 2,
        pointBackgroundColor: TEAL, pointRadius: 4,
      }]
    }
  }, [reviews])

  const barData = useMemo(() => ({
    labels: ['1★','2★','3★','4★','5★'],
    datasets: [{
      label: 'Reviews',
      data: [1,2,3,4,5].map(s => reviews.filter(r => r.rating === s).length),
      backgroundColor: 'hsla(173,80%,40%,0.75)',
      borderRadius: 6,
      borderSkipped: false,
    }]
  }), [reviews])

  const doughnutData = useMemo(() => ({
    labels: ['Positive (4-5★)','Neutral (3★)','Negative (1-2★)'],
    datasets: [{
      data: [
        reviews.filter(r => r.rating >= 4).length,
        reviews.filter(r => r.rating === 3).length,
        reviews.filter(r => r.rating <= 2).length,
      ],
      backgroundColor: [TEAL, 'hsla(45,80%,55%,0.85)','hsla(0,75%,60%,0.8)'],
      borderWidth: 0, hoverOffset: 6,
    }]
  }), [reviews])

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
    </div>
  )

  const chartBase = { responsive: true, maintainAspectRatio: false }
  const barOpts   = { ...chartBase, plugins:{legend:{display:false}}, scales:{ x:{grid:{display:false},border:{display:false}}, y:{border:{display:false},grid:{color:'#f1f5f9'},ticks:{stepSize:1}} } }
  const radarOpts = { ...chartBase, scales:{ r:{min:0,max:5,ticks:{stepSize:1,backdropColor:'transparent',color:'#9ca3af'},grid:{color:'#e5e7eb'},pointLabels:{color:'#374151',font:{size:11}}} }, plugins:{legend:{display:false}} }

  return (
    <div className="min-h-screen bg-gray-50">
      <UnifiedSidebar userType="therapist" isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className="flex flex-col">
        <header className="sticky top-0 z-10 bg-white shadow-sm border-b">
          <div className="flex h-16 items-center gap-4 px-4">
            <HamburgerButton onClick={() => setIsSidebarOpen(true)} />
            <h2 className="text-lg font-bold">My Reviews</h2>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 max-w-5xl mx-auto w-full">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Patient Feedback</h1>
            <p className="text-gray-500 text-sm mt-1">Your performance insights from {reviews.length} reviews</p>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card><CardContent className="pt-5 pb-4">
              <div className="flex items-center gap-1 mb-1">
                <span className="text-2xl font-bold">{avgRating}</span>
                <Star className="h-4 w-4 fill-amber-400 text-amber-400 mt-0.5" />
              </div>
              <p className="text-sm text-gray-500">Average Rating</p>
            </CardContent></Card>
            <Card><CardContent className="pt-5 pb-4">
              <span className="text-2xl font-bold">{reviews.length}</span>
              <p className="text-sm text-gray-500 mt-1">Total Reviews</p>
            </CardContent></Card>
            <Card><CardContent className="pt-5 pb-4">
              <span className="text-2xl font-bold">{reviews.filter(r => r.rating >= 4).length}</span>
              <p className="text-sm text-gray-500 mt-1">Positive (4-5★)</p>
            </CardContent></Card>
            <Card><CardContent className="pt-5 pb-4">
              <span className="text-2xl font-bold">{reviews.filter(r => r.comment).length}</span>
              <p className="text-sm text-gray-500 mt-1">Written Comments</p>
            </CardContent></Card>
          </div>

          {reviews.length === 0 ? (
            <Card><CardContent className="text-center py-20 text-gray-400">
              <Star className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No reviews yet</p>
              <p className="text-sm mt-1">Patient feedback will appear here after completed sessions</p>
            </CardContent></Card>
          ) : (
            <>
              {/* Charts row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card className="md:col-span-1">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-teal-600" />
                      Performance Radar
                    </CardTitle>
                    <CardDescription>Average survey scores</CardDescription>
                  </CardHeader>
                  <CardContent style={{ height: 280 }}>
                    <Radar data={radarData} options={radarOpts} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Rating Distribution</CardTitle>
                    <CardDescription>Star rating breakdown</CardDescription>
                  </CardHeader>
                  <CardContent style={{ height: 280 }}>
                    <Bar data={barData} options={barOpts} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Sentiment</CardTitle>
                    <CardDescription>Positive / Neutral / Negative</CardDescription>
                  </CardHeader>
                  <CardContent style={{ height: 280 }} className="flex items-center justify-center">
                    <Doughnut data={doughnutData} options={{ ...chartBase, plugins:{legend:{position:'bottom',labels:{boxWidth:12,padding:14}}}, cutout:'62%' }} />
                  </CardContent>
                </Card>
              </div>

              {/* Written feedback */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-teal-600" />
                    Patient Comments
                  </CardTitle>
                  <CardDescription>All written feedback you've received</CardDescription>
                </CardHeader>
                <CardContent className="divide-y">
                  {reviews.map((r, i) => (
                    <div key={i} className="py-4 first:pt-0 last:pb-0 flex gap-4">
                      <Avatar className="h-9 w-9 shrink-0">
                        <AvatarFallback className="bg-teal-100 text-teal-700 font-bold text-xs">
                          {r.patientId?.name?.split(' ').map(n=>n[0]).join('') || 'P'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
                          <span className="font-semibold text-gray-800 text-sm">{r.patientId?.name || "Patient"}</span>
                          <div className="flex items-center gap-1">
                            {[1,2,3,4,5].map(s => (
                              <Star key={s} className={`h-3 w-3 ${s <= r.rating ? "fill-amber-400 text-amber-400" : "text-gray-200"}`} />
                            ))}
                            <span className="text-xs text-gray-500 ml-1">{new Date(r.createdAt).toLocaleDateString("en-IN", { dateStyle:"medium" })}</span>
                          </div>
                        </div>
                        {r.comment
                          ? <p className="text-sm text-gray-500 italic">"{r.comment}"</p>
                          : <p className="text-xs text-gray-300 italic">No written comment</p>
                        }
                        {r.survey && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {Object.entries(r.survey).map(([k,v]) => v ? (
                              <span key={k} className="text-[10px] font-semibold text-gray-400 bg-gray-100 rounded-full px-2 py-0.5 capitalize">
                                {k}: {v}★
                              </span>
                            ) : null)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </>
          )}
        </main>
      </div>
    </div>
  )
}
