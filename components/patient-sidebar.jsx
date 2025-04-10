"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Home, LogOut, Settings, Star, User } from "lucide-react"
import { cn } from "@/lib/utils"

export function PatientSidebar() {
  const pathname = usePathname()

  const routes = [
    {
      label: "Dashboard",
      icon: Home,
      href: "/patient/dashboard",
      active: pathname === "/patient/dashboard",
    },
    {
      label: "Appointments",
      icon: Calendar,
      href: "/patient/appointments",
      active: pathname === "/patient/appointments",
    },
    {
      label: "Book New",
      icon: Clock,
      href: "/patient/book",
      active: pathname === "/patient/book",
    },
    {
      label: "Reviews",
      icon: Star,
      href: "/patient/reviews",
      active: pathname === "/patient/reviews",
    },
    {
      label: "Profile",
      icon: User,
      href: "/patient/profile",
      active: pathname === "/patient/profile",
    },
    {
      label: "Settings",
      icon: Settings,
      href: "/patient/settings",
      active: pathname === "/patient/settings",
    },
  ]

  return (
    <div className="flex flex-col h-full space-y-2 bg-white border-r">
      <div className="px-3 py-4">
        <Link href="/patient/dashboard" className="flex items-center pl-3 mb-10">
          <h1 className="text-xl font-bold text-teal-600">Speech Mate</h1>
        </Link>
        <div className="space-y-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center py-3 px-3 rounded-lg text-sm group hover:bg-teal-50",
                route.active ? "bg-teal-50 text-teal-700" : "text-gray-600",
              )}
            >
              <route.icon className={cn("h-5 w-5 mr-3", route.active ? "text-teal-700" : "text-gray-400")} />
              {route.label}
            </Link>
          ))}
        </div>
      </div>
      <div className="mt-auto p-3">
        <Link href="/">
          <Button variant="outline" className="w-full justify-start">
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </Button>
        </Link>
      </div>
    </div>
  )
}

