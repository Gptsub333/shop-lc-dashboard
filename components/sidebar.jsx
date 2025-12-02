"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Phone, BarChart3 } from "lucide-react"

export default function Sidebar() {
  const pathname = usePathname()

  const navItems = [
    { name: "Summary", href: "/summary", icon: Phone },
    // { name: "Analytics", href: "/analytics", icon: BarChart3 },
  ]

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
      <div className="p-6">
        <h1 className="text-xl font-bold text-sidebar-foreground">ShopLC</h1>
        <p className="text-sm text-muted-foreground mt-1">Voice Agent Dashboard</p>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                    }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <p className="text-xs text-muted-foreground">© 2025 ShopLC</p>
      </div>
    </aside>
  )
}
