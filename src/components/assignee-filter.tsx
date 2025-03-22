"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { cn } from "@/src/lib/utils"
import { AssigneeBadge } from "./assignee-badge"

interface Assignee {
  id: string
  name: string
  image?: string
  initials: string
}

interface AssigneeFilterProps {
  assignees: Assignee[]
  selectedAssignee: any | null
  onSelectAssignee: (assignee: Assignee | null) => void
}

export function AssigneeFilter({ assignees, selectedAssignee, onSelectAssignee }: AssigneeFilterProps) {
  if (!assignees.length) return null

  const selectedAssigneeData = selectedAssignee ? assignees.find((a) => a.id === selectedAssignee?.id) : null

  return (
    <div className="flex flex-wrap items-center gap-2 mb-6">
      <span className="text-sm font-medium text-muted-foreground mr-2">Filter by assignee:</span>
      <div className="flex flex-wrap items-center gap-2">
        {assignees.map((assignee) => (
          <Avatar
            key={assignee.id}
            className={cn(
              "h-10 w-10 cursor-pointer transition-all hover:ring-2 hover:ring-primary/50",
              selectedAssignee?.id === assignee?.id && "ring-2 ring-primary",
            )}
            onClick={() => onSelectAssignee(selectedAssignee === assignee.id ? null : assignee)}
            title={assignee.name}
          >
            <AvatarImage src={assignee.image} alt={assignee.name} />
            <AvatarFallback>{assignee.initials}</AvatarFallback>
          </Avatar>
        ))}

        {selectedAssigneeData && (
          <div className="ml-2 flex items-center">
            <AssigneeBadge
              name={selectedAssigneeData.name}
              avatar={selectedAssigneeData.image}
              initials={selectedAssigneeData.initials}
              onClear={() => onSelectAssignee(null)}
            />
          </div>
        )}
      </div>
    </div>
  )
}

