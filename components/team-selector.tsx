"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronDown, Check } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { Team } from "@/types/selector"


export function TeamSelector({ teams, selectedTeam, setSelectedTeam }: { teams: Team[], selectedTeam: Team, setSelectedTeam: (id: string) => void }) {

  const [open, setOpen] = useState(false)

  if (!selectedTeam) return null


  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="w-full justify-between px-2 text-left font-normal">
          <div className="flex items-center gap-2">
            <span className="text-lg">{selectedTeam.icon}</span>
            <span className="truncate">{selectedTeam.name}</span>
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[--radix-dropdown-trigger-width]">
        {teams.map((team: Team) => (
          <DropdownMenuItem
            key={team.id}
            className={cn("flex items-center gap-2 cursor-pointer", selectedTeam.id === team.id && "bg-accent")}
            onClick={() => {
              setSelectedTeam(team.id)
              setOpen(false)
            }}
          >
            <span className="text-lg">{team.icon}</span>
            <span>{team.name}</span>
            {selectedTeam.id === team.id && <Check className="h-4 w-4 ml-auto" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

