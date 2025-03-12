"use client"

import type React from "react"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { AlertCircle, CheckCircle } from "lucide-react"
import { TicketPreviewDialog } from "@/components/ticket-preview-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AssigneeFilter } from "@/components/assignee-filter"

// Mock ticket data
const mockTickets = [
  {
    id: "TICKET-001",
    title: "Implement user authentication",
    description: "Add login and registration functionality with JWT authentication",
    status: "Todo",
    priority: "High",
    assignee: "John Doe",
    assigneeAvatar: "/placeholder.svg?height=32&width=32",
    assigneeInitials: "JD",
    tags: ["Backend", "Security"],
    createdAt: "2023-08-15",
    comments: [
      {
        id: "comment-1",
        author: "Jane Smith",
        content: "I've started working on this. Will update the PR soon.",
        createdAt: "2023-08-16",
      },
    ],
  },
  {
    id: "TICKET-002",
    title: "Design dashboard layout",
    description: "Create responsive dashboard layout with sidebar navigation",
    status: "In Progress",
    priority: "Medium",
    assignee: "Jane Smith",
    assigneeAvatar: "/placeholder.svg?height=32&width=32",
    assigneeInitials: "JS",
    tags: ["Frontend", "UI/UX"],
    createdAt: "2023-08-16",
  },
  {
    id: "TICKET-003",
    title: "Implement API endpoints for tickets",
    description: "Create RESTful API endpoints for ticket CRUD operations",
    status: "Blocked",
    priority: "High",
    assignee: "John Doe",
    assigneeAvatar: "/placeholder.svg?height=32&width=32",
    assigneeInitials: "JD",
    tags: ["Backend", "API"],
    createdAt: "2023-08-17",
  },
  {
    id: "TICKET-004",
    title: "Add markdown support for wiki",
    description: "Implement markdown rendering for wiki pages",
    status: "Done",
    priority: "Medium",
    assignee: "Jane Smith",
    assigneeAvatar: "/placeholder.svg?height=32&width=32",
    assigneeInitials: "JS",
    tags: ["Frontend", "Feature"],
    createdAt: "2023-08-18",
  },
  {
    id: "TICKET-005",
    title: "Implement drag and drop for sprint board",
    description: "Add drag and drop functionality for moving tickets between columns",
    status: "Todo",
    priority: "Low",
    assignee: "John Doe",
    assigneeAvatar: "/placeholder.svg?height=32&width=32",
    assigneeInitials: "JD",
    tags: ["Frontend", "UX"],
    createdAt: "2023-08-19",
  },
  {
    id: "TICKET-006",
    title: "Set up CI/CD pipeline",
    description: "Configure GitHub Actions for continuous integration and deployment",
    status: "In Progress",
    priority: "Medium",
    assignee: "Jane Smith",
    assigneeAvatar: "/placeholder.svg?height=32&width=32",
    assigneeInitials: "JS",
    tags: ["DevOps", "Infrastructure"],
    createdAt: "2023-08-20",
  },
  {
    id: "TICKET-007",
    title: "Implement user roles and permissions",
    description: "Add role-based access control for different user types",
    status: "Todo",
    priority: "High",
    assignee: "John Doe",
    assigneeAvatar: "/placeholder.svg?height=32&width=32",
    assigneeInitials: "JD",
    tags: ["Backend", "Security"],
    createdAt: "2023-08-21",
  },
  {
    id: "TICKET-008",
    title: "Add dark mode support",
    description: "Implement dark mode toggle and theme persistence",
    status: "Done",
    priority: "Low",
    assignee: "Jane Smith",
    assigneeAvatar: "/placeholder.svg?height=32&width=32",
    assigneeInitials: "JS",
    tags: ["Frontend", "UI"],
    createdAt: "2023-08-22",
  },
  {
    id: "TICKET-009",
    title: "Optimize database queries",
    description: "Improve performance of database queries for ticket listing",
    status: "Todo",
    priority: "Medium",
    assignee: "Alex Johnson",
    assigneeAvatar: "/placeholder.svg?height=32&width=32",
    assigneeInitials: "AJ",
    tags: ["Backend", "Performance"],
    createdAt: "2023-08-23",
  },
  {
    id: "TICKET-010",
    title: "Implement email notifications",
    description: "Send email notifications for ticket updates and mentions",
    status: "In Progress",
    priority: "Medium",
    assignee: "Alex Johnson",
    assigneeAvatar: "/placeholder.svg?height=32&width=32",
    assigneeInitials: "AJ",
    tags: ["Backend", "Feature"],
    createdAt: "2023-08-24",
  },
]

const priorityColors = {
  High: "bg-red-500",
  Medium: "bg-yellow-500",
  Low: "bg-green-500",
}

export default function SprintBoardPage() {
  const { toast } = useToast()
  const [tickets, setTickets] = useState(mockTickets)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<(typeof tickets)[0] | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [selectedAssignee, setSelectedAssignee] = useState<string | null>(null)

  // Extract unique assignees from tickets
  const assignees = useMemo(() => {
    const uniqueAssignees = new Map()

    tickets.forEach((ticket) => {
      if (!uniqueAssignees.has(ticket.assignee)) {
        uniqueAssignees.set(ticket.assignee, {
          name: ticket.assignee,
          avatar: ticket.assigneeAvatar,
          initials: ticket.assigneeInitials,
        })
      }
    })

    return Array.from(uniqueAssignees.values())
  }, [tickets])

  // Filter tickets based on selected assignee
  const filteredTickets = useMemo(() => {
    if (!selectedAssignee) return tickets
    return tickets.filter((ticket) => ticket.assignee === selectedAssignee)
  }, [tickets, selectedAssignee])

  const handleCompleteSprint = () => {
    // Move all "Done" tickets to a completed state or archive
    const updatedTickets = tickets.filter((ticket) => ticket.status !== "Done")
    setTickets(updatedTickets)
    setIsDialogOpen(false)

    toast({
      title: "Sprint completed",
      description: "All completed tickets have been archived.",
    })
  }

  const handleDragStart = (e: React.DragEvent, ticketId: string) => {
    e.dataTransfer.setData("ticketId", ticketId)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, status: string) => {
    e.preventDefault()
    const ticketId = e.dataTransfer.getData("ticketId")

    const updatedTickets = tickets.map((ticket) => {
      if (ticket.id === ticketId) {
        return { ...ticket, status }
      }
      return ticket
    })

    setTickets(updatedTickets)

    toast({
      title: "Ticket updated",
      description: `Ticket moved to ${status}`,
    })
  }

  const handleTicketClick = (ticket: (typeof tickets)[0]) => {
    setSelectedTicket(ticket)
    setIsPreviewOpen(true)
  }

  const handleSaveTicket = (updatedTicket: (typeof tickets)[0]) => {
    // Update the ticket in the tickets array
    const updatedTickets = tickets.map((ticket) => (ticket.id === updatedTicket.id ? updatedTicket : ticket))

    setTickets(updatedTickets)
  }

  const handleSelectAssignee = (assignee: string | null) => {
    setSelectedAssignee(assignee)

    if (assignee) {
      toast({
        title: "Filter applied",
        description: `Showing tickets assigned to ${assignee}`,
      })
    }
  }

  const ticketsByStatus = {
    Todo: filteredTickets.filter((ticket) => ticket.status === "Todo"),
    "In Progress": filteredTickets.filter((ticket) => ticket.status === "In Progress"),
    Blocked: filteredTickets.filter((ticket) => ticket.status === "Blocked"),
    Done: filteredTickets.filter((ticket) => ticket.status === "Done"),
  }

  // Calculate ticket counts for the status header
  const totalTickets = filteredTickets.length
  const ticketCounts = {
    Todo: ticketsByStatus.Todo.length,
    "In Progress": ticketsByStatus["In Progress"].length,
    Blocked: ticketsByStatus.Blocked.length,
    Done: ticketsByStatus.Done.length,
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Sprint Board</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <CheckCircle className="mr-2 h-4 w-4" /> Complete Sprint
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Complete Sprint</DialogTitle>
              <DialogDescription>
                Are you sure you want to complete the current sprint? This will archive all completed tickets.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCompleteSprint}>Complete Sprint</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Assignee filter row */}
      <AssigneeFilter
        assignees={assignees}
        selectedAssignee={selectedAssignee}
        onSelectAssignee={handleSelectAssignee}
      />

      {/* Status summary */}
      {selectedAssignee && (
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-medium">
            Showing {totalTickets} ticket{totalTickets !== 1 ? "s" : ""} assigned to {selectedAssignee}
          </span>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-4">
        {Object.entries(ticketsByStatus).map(([status, statusTickets]) => (
          <Card
            key={status}
            className="flex flex-col"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, status)}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{status}</CardTitle>
              <CardDescription>
                {statusTickets.length} ticket{statusTickets.length !== 1 ? "s" : ""}
                {selectedAssignee &&
                  ` (${ticketCounts[status as keyof typeof ticketCounts]}/${tickets.filter((t) => t.status === status).length} total)`}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto">
              <div className="space-y-3">
                {statusTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="flex items-center rounded-md border bg-card p-3 shadow-sm cursor-pointer hover:border-primary transition-colors"
                    draggable
                    onDragStart={(e) => handleDragStart(e, ticket.id)}
                    onClick={() => handleTicketClick(ticket)}
                  >
                    {/* Priority indicator */}
                    <div
                      className={`w-1.5 h-14 rounded-full mr-3 ${priorityColors[ticket.priority as keyof typeof priorityColors]}`}
                      aria-label={`Priority: ${ticket.priority}`}
                    />

                    {/* Ticket content */}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{ticket.title}</div>
                      <div className="text-xs text-muted-foreground mt-1">{ticket.id}</div>
                    </div>

                    {/* Assignee avatar */}
                    <Avatar className="h-8 w-8 ml-2">
                      <AvatarImage src={ticket.assigneeAvatar} alt={ticket.assignee} />
                      <AvatarFallback>{ticket.assigneeInitials}</AvatarFallback>
                    </Avatar>
                  </div>
                ))}
                {statusTickets.length === 0 && (
                  <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                    <AlertCircle className="h-8 w-8 text-muted-foreground" />
                    <h3 className="mt-2 text-sm font-medium">No tickets</h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {selectedAssignee
                        ? `No ${status.toLowerCase()} tickets assigned to ${selectedAssignee}`
                        : "Drag and drop tickets here."}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <TicketPreviewDialog
        ticket={selectedTicket}
        open={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
        onSave={handleSaveTicket}
      />
    </div>
  )
}

