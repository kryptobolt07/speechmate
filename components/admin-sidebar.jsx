"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { BarChart3, Building, Calendar, Home, LogOut, Shuffle, Star, User, Users, LayoutDashboard, Hospital, X } from "lucide-react"
import { cn } from "@/lib/utils"

export function AdminSidebar({ isOpen, setIsOpen }) {
  const pathname = usePathname()

  const routes = [
    {
      label: "Dashboard",
      icon: Home,
      href: "/admin/dashboard",
      active: pathname === "/admin/dashboard",
    },
    {
      label: "Therapists",
      icon: Users,
      href: "/admin/therapists",
      active: pathname === "/admin/therapists",
    },
    {
      label: "Appointments",
      icon: Calendar,
      href: "/admin/appointments",
      active: pathname === "/admin/appointments",
    },
    {
      label: "Hospitals",
      icon: Building,
      href: "/admin/hospitals",
      active: pathname === "/admin/hospitals",
    },
    {
      label: "Reviews",
      icon: Star,
      href: "/admin/reviews",
      active: pathname === "/admin/reviews",
    },
    {
      label: "Reassignments",
      icon: Shuffle,
      href: "/admin/reassignments",
      active: pathname === "/admin/reassignments",
    },
    {
      label: "Analytics",
      icon: BarChart3,
      href: "/admin/analytics",
      active: pathname === "/admin/analytics",
    },
    {
      label: "Profile",
      icon: User,
      href: "/admin/profile",
      active: pathname === "/admin/profile",
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
      className={`fixed inset-y-0 left-0 z-40 flex h-full w-64 transform flex-col border-r bg-white transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:border-r md:bg-gray-100 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
    >
      <div className="flex h-16 items-center justify-between border-b px-4 bg-teal-600 text-white">
        <Link href="/admin/dashboard" className="text-lg font-bold">
          SpeechMate Admin
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
            // TODO: Add logout functionality
            className="w-full flex items-center rounded-md px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
            onClick={() => alert('Logout not implemented')}
        >
            <LogOut className="mr-3 h-5 w-5" />
            Logout
        </button>
      </div>
    </div>
    </>
  )
}

