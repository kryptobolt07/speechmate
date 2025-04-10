"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Calendar, ClipboardList, Home, LogOut, Settings, Star, User, Users } from "lucide-react"
import { cn } from "@/lib/utils"

export function TherapistSidebar() {
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
    {
      label: "Settings",
      icon: Settings,
      href: "/therapist/settings",
      active: pathname === "/therapist/settings",
    },
  ]

  return (
    <div className="flex flex-col h-full space-y-2 bg-white border-r">
      <div className="px-3 py-4">
        <Link href="/therapist/dashboard" className="flex items-center pl-3 mb-10">
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

