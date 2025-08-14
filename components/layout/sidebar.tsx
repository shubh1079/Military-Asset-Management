"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, ShoppingCart, ArrowLeftRight, Users, Shield, Menu, X, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface SidebarProps {
  user: {
    full_name: string
    role: string
    base_id: number | null
  }
  onLogout: () => void
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: BarChart3, roles: ["admin", "base_commander", "logistics_officer"] },
  {
    name: "Purchases",
    href: "/purchases",
    icon: ShoppingCart,
    roles: ["admin", "base_commander", "logistics_officer"],
  },
  {
    name: "Transfers",
    href: "/transfers",
    icon: ArrowLeftRight,
    roles: ["admin", "base_commander", "logistics_officer"],
  },
  { name: "Assignments", href: "/assignments", icon: Users, roles: ["admin", "base_commander"] },
  { name: "Admin", href: "/admin", icon: Shield, roles: ["admin"] },
]

export default function Sidebar({ user, onLogout }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const filteredNavigation = navigation.filter((item) => item.roles.includes(user.role))

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <h1 className="text-xl font-bold text-gray-900">Military Assets</h1>
        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsOpen(false)}>
          <X className="h-6 w-6" />
        </Button>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {filteredNavigation.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
              )}
              onClick={() => setIsOpen(false)}
            >
              <Icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t">
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-900">{user.full_name}</p>
          <p className="text-xs text-gray-500 capitalize">{user.role.replace("_", " ")}</p>
        </div>
        <Button variant="outline" size="sm" onClick={onLogout} className="w-full bg-transparent">
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile menu button */}
      <Button variant="ghost" size="icon" className="md:hidden fixed top-4 left-4 z-50" onClick={() => setIsOpen(true)}>
        <Menu className="h-6 w-6" />
      </Button>

      {/* Mobile sidebar */}
      {isOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsOpen(false)} />
          <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg">
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-white border-r">
        <SidebarContent />
      </div>
    </>
  )
}
