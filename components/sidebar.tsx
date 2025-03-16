"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart, FileText, Home, LayoutDashboard, Menu, Settings, Ticket, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { UserBadge } from "./user-badge"
import { TeamSelector } from "./team-selector"
import { Separator } from "@/components/ui/separator"
import { OrganizationBadge } from "@/components/organization-badge"
import { useUser } from "@/contexts/user-provider"
import { useTeam } from "@/contexts/team-provider"
import { Organization } from "@/types/selector"

export function Sidebar() {
  const { user } = useUser()
  const { teamId } = useTeam()

  const roles = user?.TeamRoles
  const teams = roles?.map((role) => role.Team) || []
  const selectedTeam = teams.find((team) => team.id === teamId)
  const selectedOrganization = selectedTeam?.Organization as Organization

  const [expanded, setExpanded] = useState(true)
  const pathname = usePathname()

  const toggleSidebar = () => {
    setExpanded(!expanded)
  }

  // Get the team ID from the URL or use the selected team
  //const teamId = selectedTeam.id || ""

  const navItems = [
    {
      name: "Dashboard",
      href: `/dashboard/${teamId}`,
      icon: LayoutDashboard,
    },
    {
      name: "Sprint Board",
      href: `/sprint-board/${teamId}`,
      icon: BarChart,
    },
    {
      name: "Tickets",
      href: `/tickets/${teamId}`,
      icon: Ticket,
    },
    {
      name: "Wiki",
      href: `/wiki/${teamId}`,
      icon: FileText,
    },
    {
      name: "Settings",
      href: `/settings/${teamId}`,
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
          <Link href={`/`} className="flex items-center gap-2 font-bold text-xl">
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
        <div className="px-3 mb-2 space-y-2">
          <OrganizationBadge />
          <TeamSelector />
        </div>
      )}


      {!expanded && (
        <div className="flex flex-col content-center justify-center my-2 width-full">
          <div className="m-2 h-8 w-8 flex self-center items-center justify-center rounded-md bg-primary/10 text-primary">
            {selectedOrganization?.icon}
          </div>
          <div className="m-2 h-8 w-8 flex self-center items-center justify-center rounded-md bg-primary/10 text-primary">
            {selectedTeam?.icon}
          </div>
        </div>
      )}

      <Separator className="my-2" />

      <nav className="flex-1 space-y-1 p-2">
        {navItems.map((item) => {
          // Check if the current path matches this nav item
          const isActive = pathname === item.href || (pathname?.startsWith(item.href))

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

