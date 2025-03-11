"use client"

import { useEffect } from "react"
import { useTeam } from "@/contexts/team-context"
import TicketsPage from "@/app/tickets/page"

export default function TeamTickets({ params }: { params: { teamId: string } }) {
  const { teamId } = params
  const { setSelectedTeam, selectedTeam } = useTeam()

  // Sync URL team ID with context
  useEffect(() => {
    if (selectedTeam?.id !== teamId) {
      setSelectedTeam(teamId)
    }
  }, [teamId, selectedTeam, setSelectedTeam])

  useTeam(() => {
    return {
      teamId,
    }
  });

  return <TicketsPage />
}

