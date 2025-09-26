"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { 
  Calendar, 
  Clock, 
  Home, 
  LogOut, 
  Star, 
  User, 
  X, 
  Menu,
  Users,
  ClipboardList,
  BarChart3,
  Building,
  Shuffle
} from "lucide-react"

const PATIENT_ROUTES = [
  { label: "Dashboard", icon: Home, href: "/patient/dashboard" },
  { label: "Appointments", icon: Calendar, href: "/patient/appointments" },
  { label: "Book New", icon: Clock, href: "/patient/book" },
  { label: "Reviews", icon: Star, href: "/patient/reviews" },
  { label: "Profile", icon: User, href: "/patient/profile" },
]

const THERAPIST_ROUTES = [
  { label: "Dashboard", icon: Home, href: "/therapist/dashboard" },
  { label: "Schedule", icon: Calendar, href: "/therapist/schedule" },
  { label: "Patients", icon: Users, href: "/therapist/patients" },
  { label: "Session Notes", icon: ClipboardList, href: "/therapist/notes" },
  { label: "Reviews", icon: Star, href: "/therapist/reviews" },
  { label: "Profile", icon: User, href: "/therapist/profile" },
]

const ADMIN_ROUTES = [
  { label: "Dashboard", icon: Home, href: "/admin/dashboard" },
  { label: "Therapists", icon: Users, href: "/admin/therapists" },
  { label: "Appointments", icon: Calendar, href: "/admin/appointments" },
  { label: "Hospitals", icon: Building, href: "/admin/hospitals" },
  { label: "Reviews", icon: Star, href: "/admin/reviews" },
  { label: "Reassignments", icon: Shuffle, href: "/admin/reassignments" },
  { label: "Analytics", icon: BarChart3, href: "/admin/analytics" },
  { label: "Profile", icon: User, href: "/admin/profile" },
]

export function UnifiedSidebar({ userType, isOpen, setIsOpen }) {
  const pathname = usePathname()
  
  const getRoutes = () => {
    switch (userType) {
      case 'patient': return PATIENT_ROUTES
      case 'therapist': return THERAPIST_ROUTES
      case 'admin': return ADMIN_ROUTES
      default: return []
    }
  }

  const routes = getRoutes()
  const isActive = (path) => pathname === path

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      })
      
      if (response.ok) {
        // Redirect to login page
        window.location.href = '/login'
      } else {
        alert('Logout failed. Please try again.')
      }
    } catch (error) {
      console.error('Logout error:', error)
      alert('Logout failed. Please try again.')
    }
  }

  return (
    <>
      {/* Overlay for mobile */}
      <div 
        className={`fixed inset-0 z-30 bg-black/50 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 flex h-full w-64 transform flex-col border-r bg-white transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex h-16 items-center justify-between border-b px-4 bg-teal-600 text-white">
          <Link href={`/${userType}/dashboard`} className="text-lg font-bold">
            SpeechMate
          </Link>
          <button 
            onClick={() => setIsOpen(false)} 
            className="p-1 text-white hover:bg-teal-700 rounded-md"
            aria-label="Close sidebar"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <nav className="flex-1 space-y-1 p-4">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={`flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${isActive(route.href) ? "bg-teal-100 text-teal-700" : "text-gray-700 hover:bg-gray-200"}`}
              onClick={() => setIsOpen(false)}
            >
              <route.icon className="mr-3 h-5 w-5" />
              {route.label}
            </Link>
          ))}
        </nav>
        
        <div className="mt-auto border-t p-4">
          <button
            className="w-full flex items-center rounded-md px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
            onClick={handleLogout}
          >
            <LogOut className="mr-3 h-5 w-5" />
            Logout
          </button>
        </div>
      </div>
    </>
  )
}

export function HamburgerButton({ onClick }) {
  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={onClick}
      className="hover:bg-gray-100"
    >
      <Menu className="h-6 w-6" />
      <span className="sr-only">Open menu</span>
    </Button>
  )
}
