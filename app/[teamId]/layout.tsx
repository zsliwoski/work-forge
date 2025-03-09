import type React from "react"
import { notFound } from "next/navigation"
import { teams } from "@/contexts/team-context"

export default function TeamLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { teamId: string }
}) {
  const { teamId } = params

  // Validate team ID
  //const isValidTeam = teams.some((team) => team.id === teamId)

  //if (!isValidTeam) {
  //  notFound()
  //}

  return children
}

