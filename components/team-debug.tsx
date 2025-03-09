"use client"

import { useContext } from "react"
import { usePathname } from "next/navigation"
import { TeamContext, teams } from "@/contexts/team-context"

export function TeamDebug() {
  const pathname = usePathname()
  // Safely access the context without throwing an error if it's undefined
  const teamContext = useContext(TeamContext)

  // Don't render in production or if context is not available
  if (process.env.NODE_ENV === "production" || !teamContext) return null

  const { selectedTeam } = teamContext

  return (
    <div className="fixed bottom-4 right-4 z-50 p-4 bg-black/80 text-white rounded-md text-xs max-w-xs">
      <h4 className="font-bold mb-2">Team Debug</h4>
      <div>
        <p>Path: {pathname}</p>
        <p>
          Selected Team: {selectedTeam?.name} ({selectedTeam?.id})
        </p>
        <p>Available Teams: {teams.map((t) => t.id).join(", ")}</p>
      </div>
    </div>
  )
}

