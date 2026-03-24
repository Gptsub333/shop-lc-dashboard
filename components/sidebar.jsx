"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Phone, BarChart3, TrendingUp, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Sidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const navItems = [
    { name: "CS Analytics", href: "/analytics", icon: BarChart3 },
    { name: "Sales Analytics", href: "/sales-analytics", icon: TrendingUp },
    { name: "Summary", href: "/summary", icon: Phone },
  ]

  return (
    <aside 
      className={`${
        isCollapsed ? "w-20" : "w-64"
      } bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300 ease-in-out relative`}
    >
      {/* Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 h-6 w-6 rounded-full border border-sidebar-border bg-sidebar shadow-md hover:bg-sidebar-accent z-10"
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </Button>

      {/* Header */}
      <div className={`${isCollapsed ? "p-4" : "p-6"} transition-all duration-300`}>
        {isCollapsed ? (
          <div className="flex justify-center">
            <h1 className="text-xl font-bold text-sidebar-foreground">SL</h1>
          </div>
        ) : (
          <>
            <h1 className="text-xl font-bold text-sidebar-foreground">ShopLC</h1>
            <p className="text-sm text-muted-foreground mt-1">Voice Agent Dashboard</p>
          </>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center ${
                    isCollapsed ? "justify-center px-2" : "gap-3 px-4"
                  } py-3 rounded-lg transition-all ${
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                  }`}
                  title={isCollapsed ? item.name : ""}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  {!isCollapsed && <span className="font-medium">{item.name}</span>}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className={`${isCollapsed ? "p-2" : "p-4"} border-t border-sidebar-border transition-all duration-300`}>
        {!isCollapsed && (
          <p className="text-xs text-muted-foreground">© 2025 ShopLC</p>
        )}
      </div>
    </aside>
  )
}
