"use client"

import { useState } from "react"
import { Button } from "@/src/components/ui/button"
import { ChevronDown, Check } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/src/components/ui/dropdown-menu"
import { cn } from "@/src/lib/utils"
import { Team } from "@/src/types/selector"
import { useUser } from "@/src/contexts/user-provider"
import { useTeam } from "@/src/contexts/team-provider"

export function TeamSelector() {
  const { user } = useUser()
  const { teamId, setTeamId } = useTeam()
  const [open, setOpen] = useState(false)

  const roles = user?.TeamRoles
  const teams = roles?.map((role) => role.Team) || []
  const selectedTeam = teams.find((team) => team.id === teamId)

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="w-full justify-between px-2 text-left font-normal">
          <div className="flex items-center gap-2">
            <span className="text-lg">{selectedTeam?.icon}</span>
            <span className="truncate">{selectedTeam?.name}</span>
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[--radix-dropdown-trigger-width]">
        {teams.map((team: Team) => (
          <DropdownMenuItem
            key={team.id}
            className={cn("flex items-center gap-2 cursor-pointer", selectedTeam?.id === team.id && "bg-accent")}
            onClick={() => {
              setTeamId(team.id)
              setOpen(false)
            }}
          >
            <span className="text-lg">{team.icon}</span>
            <span>{team.name}</span>
            {selectedTeam?.id === team.id && <Check className="h-4 w-4 ml-auto" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

