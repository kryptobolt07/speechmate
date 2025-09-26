"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Calendar, ClipboardList, Home, LogOut, Star, User, Users, X } from "lucide-react"
import { cn } from "@/lib/utils"

export function TherapistSidebar({ isOpen, setIsOpen }) {
  const pathname = usePathname()

  const routes = [
    {
      label: "Dashboard",
      icon: Home,
      href: "/therapist/dashboard",
      active: pathname === "/therapist/dashboard",
    },
    {
      label: "Schedule",
      icon: Calendar,
      href: "/therapist/schedule",
      active: pathname === "/therapist/schedule",
    },
    {
      label: "Patients",
      icon: Users,
      href: "/therapist/patients",
      active: pathname === "/therapist/patients",
    },
    {
      label: "Session Notes",
      icon: ClipboardList,
      href: "/therapist/notes",
      active: pathname === "/therapist/notes",
    },
    {
      label: "Reviews",
      icon: Star,
      href: "/therapist/reviews",
      active: pathname === "/therapist/reviews",
    },
    {
      label: "Profile",
      icon: User,
      href: "/therapist/profile",
      active: pathname === "/therapist/profile",
    },
  ]

  const isActive = (path) => pathname === path

  return (
    <>
      {/* Overlay for mobile */}
      <div 
        className={`fixed inset-0 z-30 bg-black/50 transition-opacity md:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 flex h-full w-64 transform flex-col border-r bg-white transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:border-r ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex h-16 items-center justify-between border-b px-4 bg-teal-600 text-white">
          <Link href="/therapist/dashboard" className="text-lg font-bold">
            SpeechMate
          </Link>
          {/* Close button for mobile */}
          <button 
            onClick={() => setIsOpen(false)} 
            className="md:hidden p-1 text-white hover:bg-teal-700 rounded-md"
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
              onClick={() => setIsOpen(false)} // Close sidebar on navigation (mobile)
            >
              <route.icon className="mr-3 h-5 w-5" />
              {route.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto border-t p-4">
          <button
            className="w-full flex items-center rounded-md px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
            onClick={() => {
              // TODO: Add logout functionality
              alert('Logout not implemented')
            }}
          >
            <LogOut className="mr-3 h-5 w-5" />
            Logout
          </button>
        </div>
      </div>
    </>
  )
}

