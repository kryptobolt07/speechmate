"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { BarChart3, Building, Calendar, Home, LogOut, Settings, Shuffle, Star, User, Users } from "lucide-react"
import { cn } from "@/lib/utils"

export function AdminSidebar() {
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
    {
      label: "Settings",
      icon: Settings,
      href: "/admin/settings",
      active: pathname === "/admin/settings",
    },
  ]

  return (
    <div className="flex flex-col h-full space-y-2 bg-white border-r">
      <div className="px-3 py-4">
        <Link href="/admin/dashboard" className="flex items-center pl-3 mb-10">
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

