"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { AssigneeBadge } from "./assignee-badge"

interface Assignee {
    name: string
    avatar?: string
    initials: string
}

interface AssigneeFilterProps {
    assignees: Assignee[]
    selectedAssignee: string | null
    onSelectAssignee: (assignee: string | null) => void
}

export function AssigneeFilter({ assignees, selectedAssignee, onSelectAssignee }: AssigneeFilterProps) {
    if (!assignees.length) return null

    const selectedAssigneeData = selectedAssignee ? assignees.find((a) => a.name === selectedAssignee) : null

    return (
        <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="text-sm font-medium text-muted-foreground mr-2">Filter by assignee:</span>
            <div className="flex flex-wrap items-center gap-2">
                {assignees.map((assignee) => (
                    <Avatar
                        key={assignee.name}
                        className={cn(
                            "h-10 w-10 cursor-pointer transition-all hover:ring-2 hover:ring-primary/50",
                            selectedAssignee === assignee.name && "ring-2 ring-primary",
                        )}
                        onClick={() => onSelectAssignee(selectedAssignee === assignee.name ? null : assignee.name)}
                        title={assignee.name}
                    >
                        <AvatarImage src={assignee.avatar} alt={assignee.name} />
                        <AvatarFallback>{assignee.initials}</AvatarFallback>
                    </Avatar>
                ))}

                {selectedAssigneeData && (
                    <div className="ml-2 flex items-center">
                        <AssigneeBadge
                            name={selectedAssigneeData.name}
                            avatar={selectedAssigneeData.avatar}
                            initials={selectedAssigneeData.initials}
                            onClear={() => onSelectAssignee(null)}
                        />
                    </div>
                )}
            </div>
        </div>
    )
}

