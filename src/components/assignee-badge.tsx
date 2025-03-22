"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { Badge } from "@/src/components/ui/badge"
import { X } from "lucide-react"

interface AssigneeBadgeProps {
  name: string
  avatar?: string
  initials: string
  onClear: () => void
}

export function AssigneeBadge({ name, avatar, initials, onClear }: AssigneeBadgeProps) {
  return (
    <Badge variant="secondary" className="flex items-center gap-2 px-2 py-1">
      <Avatar className="h-5 w-5">
        <AvatarImage src={avatar} alt={name} />
        <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
      </Avatar>
      <span>{name}</span>
      <button
        onClick={(e) => {
          e.stopPropagation()
          onClear()
        }}
        className="ml-1 rounded-full text-muted-foreground hover:text-foreground"
        aria-label="Clear filter"
      >
        <X className="h-3 w-3" />
      </button>
    </Badge>
  )
}

