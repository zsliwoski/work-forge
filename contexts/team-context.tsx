"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"

// Mock team data
export const teams = [
  { id: "team-1", name: "Engineering", icon: "🛠️" },
  { id: "team-2", name: "Design", icon: "🎨" },
  { id: "team-3", name: "Marketing", icon: "📣" },
  { id: "team-4", name: "Product", icon: "📱" },
]

const DEFAULT_TEAM_ID = "team-1"

type TeamContextType = {
  teams: typeof teams
  selectedTeam: (typeof teams)[0] | undefined
  setSelectedTeam: (teamId: string) => void
}

// Export the context so it can be accessed directly if needed
export const TeamContext = createContext<TeamContextType | undefined>(undefined)

export function TeamProvider({ children }: { children: ReactNode }) {
  const [selectedTeam, setSelectedTeam] = useState<(typeof teams)[0] | undefined>(undefined)
  const router = useRouter()
  const pathname = usePathname()

  // Initialize selected team from localStorage or use default
  useEffect(() => {
    try {
      const storedTeamId = localStorage.getItem("selectedTeamId") || DEFAULT_TEAM_ID
      const team = teams.find((t) => t.id === storedTeamId)
      setSelectedTeam(team)
    } catch (error) {
      // Handle localStorage errors (e.g., in environments where it's not available)
      console.error("Error accessing localStorage:", error)
      // Fall back to default team
      const team = teams.find((t) => t.id === DEFAULT_TEAM_ID)
      setSelectedTeam(team)
    }
  }, [])

  // Handle team selection
  const handleTeamChange = (teamId: string) => {
    const team = teams.find((t) => t.id === teamId)
    if (team) {
      setSelectedTeam(team)
      try {
        localStorage.setItem("selectedTeamId", teamId)
      } catch (error) {
        console.error("Error setting localStorage:", error)
      }

      // Update URL to include team ID
      const currentPath = pathname || "/"
      const basePath = currentPath.split("/").filter(Boolean)[1] || ""

      // Construct new path with team ID
      let newPath = `/${teamId}`
      if (basePath) {
        newPath += `/${basePath}`
      }

      router.push(newPath)
    }
  }

  return (
    <TeamContext.Provider
      value={{
        teams,
        selectedTeam,
        setSelectedTeam: handleTeamChange,
      }}
    >
      {children}
    </TeamContext.Provider>
  )
}

export function useTeam() {
  const context = useContext(TeamContext)
  if (context === undefined) {
    throw new Error("useTeam must be used within a TeamProvider")
  }
  return context
}

