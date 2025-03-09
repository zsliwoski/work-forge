"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart, FileText, Home, LayoutDashboard, Menu, Settings, Ticket, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { UserBadge } from "./user-badge"
import { TeamSelector } from "./team-selector"
import { useTeam } from "@/contexts/team-context"
import { Separator } from "@/components/ui/separator"

export function Sidebar() {
  const [expanded, setExpanded] = useState(true)
  const pathname = usePathname()
  const { selectedTeam } = useTeam()

  const toggleSidebar = () => {
    setExpanded(!expanded)
  }

  // Get the team ID from the URL or use the selected team
  const teamId = selectedTeam?.id || ""

  const navItems = [
    {
      name: "Dashboard",
      href: `/${teamId}`,
      icon: LayoutDashboard,
    },
    {
      name: "Sprint Board",
      href: `/${teamId}/sprint-board`,
      icon: BarChart,
    },
    {
      name: "Tickets",
      href: `/${teamId}/tickets`,
      icon: Ticket,
    },
    {
      name: "Wiki",
      href: `/${teamId}/wiki`,
      icon: FileText,
    },
    {
      name: "Settings",
      href: `/${teamId}/settings`,
      icon: Settings,
    },
  ]

  return (
    <div
      className={cn(
        "relative flex h-full flex-col border-r bg-card transition-all duration-300 ease-in-out",
        expanded ? "w-64" : "w-16",
      )}
    >
      <div className="flex items-center justify-between p-4">
        {expanded && (
          <Link href={`/${teamId}`} className="flex items-center gap-2 font-bold text-xl">
            <Home className="h-5 w-5" />
            <span>WorkForge</span>
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="ml-auto"
          aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
        >
          {expanded ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {expanded && (
        <div className="px-3 mb-2">
          <TeamSelector />
        </div>
      )}

      {!expanded && (
        <div className="flex justify-center my-2">
          <div className="h-8 w-8 flex items-center justify-center rounded-md bg-primary/10 text-primary">
            {selectedTeam?.icon}
          </div>
        </div>
      )}

      <Separator className="my-2" />

      <nav className="flex-1 space-y-1 p-2">
        {navItems.map((item) => {
          // Check if the current path matches this nav item
          const isActive = pathname === item.href || (pathname?.startsWith(item.href) && item.href !== `/${teamId}`)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground",
                !expanded && "justify-center px-0",
              )}
            >
              <item.icon className={cn("h-5 w-5", expanded && "mr-2")} />
              {expanded && <span>{item.name}</span>}
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto p-4">
        <UserBadge expanded={expanded} />
      </div>
    </div>
  )
}

