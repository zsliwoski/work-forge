"use client"

import { useEffect } from "react"
import { useTeam } from "@/contexts/team-context"
import WikiPage from "@/app/wiki/page"

export default function TeamWiki({ params }: { params: { teamId: string } }) {
  const { teamId } = params
  const { setSelectedTeam, selectedTeam } = useTeam()

  // Sync URL team ID with context
  useEffect(() => {
    if (selectedTeam?.id !== teamId) {
      setSelectedTeam(teamId)
    }
  }, [teamId, selectedTeam, setSelectedTeam])

  return <WikiPage />
}

