"use client"

import type React from "react"

import { useState, useMemo } from "react"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/ui/dialog"
import { useToast } from "@/src/components/ui/use-toast"
import { AlertCircle, CheckCircle } from "lucide-react"
import { TicketPreviewDialog } from "@/src/components/ticket-preview-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { AssigneeFilter } from "@/src/components/assignee-filter"
import useSWR, { mutate } from "swr"
import { fetcher } from "@/src/lib/db"
import { on } from "events"

const priorityColors = {
  HIGH: "bg-red-500",
  MEDIUM: "bg-yellow-500",
  LOW: "bg-green-500",
}

export default function SprintBoardPage({ params }: { params: { teamId: string } }) {
  const { toast } = useToast()
  const { teamId } = params
  const [tickets, setTickets] = useState([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<(typeof tickets)[0] | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [selectedAssignee, setSelectedAssignee] = useState<any | null>(null)

  const { data, error, isLoading } = useSWR(`/api/sprint/${teamId}`, fetcher, { revalidateOnFocus: false })

  // Extract unique assignees from tickets
  const assignees = useMemo(() => {
    const uniqueAssignees = new Map()

    tickets.forEach((ticket) => {
      if (!uniqueAssignees.has(ticket.assignee)) {
        uniqueAssignees.set(ticket.assignee, {
          id: ticket.assignee?.id,
          name: ticket.assignee?.name ? ticket.assignee?.name : "Unassigned",
          image: ticket.assignee?.image,
          initials: ticket.assignee?.name[0],
        })
      }
    })

    return Array.from(uniqueAssignees.values())
  }, [tickets])

  // Filter tickets based on selected assignee
  const filteredTickets = useMemo(() => {
    if (!selectedAssignee) return tickets
    return tickets.filter((ticket) => ticket.assignee?.id === selectedAssignee?.id)
  }, [tickets, selectedAssignee])



  const onStartNextSprint = async () => {
    try {
      const response = await fetch(`/api/sprint/${teamId}?start`, {
        method: "PUT",
      })

      if (response.ok) {
        toast({
          title: "Sprint Started",
          description: "The next sprint has been started successfully.",
        })
        window.location.reload()
      } else {
        throw new Error("Failed to start sprint")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start the next sprint.",
        variant: "destructive",
      })
    }
  }



  if (error) return <div>Failed to load</div>
  if (isLoading) return <div>Loading...</div>
  if (data) console.log(data)

  // Handle case when no current sprint is found
  if (!data?.sprint) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] gap-6 p-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>No Active Sprint</CardTitle>
            <CardDescription>There is no active sprint for this team.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {data?.nextSprint ? (
              <>
                <p>Would you like to start the next planned sprint?</p>
                <Button
                  onClick={onStartNextSprint}
                >
                  Start Next Sprint
                </Button>
              </>
            ) : (
              <>
                <p>There are no planned sprints. You can create tickets first and then plan a new sprint.</p>
                <Button
                  onClick={() => {
                    window.location.href = `/tickets/${teamId}`
                  }}
                >
                  Go to Tickets
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  // If we have a sprint, set the tickets
  if (data.sprint) {
    const sprint = data.sprint
    const sprintTickets = sprint?.tickets ? sprint.tickets : []
    if (tickets.length === 0) {
      setTickets(sprintTickets)
    }
  }

  const handleCompleteSprint = async () => {
    // Move all "Done" tickets to a completed state or archive
    const updatedTickets = tickets.filter((ticket) => ticket.status !== "Done")
    setTickets(updatedTickets)
    try {
      const response = await fetch(`/api/sprint/${teamId}?close`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      })
      if (!response.ok) throw new Error("Failed to start sprint")
      await response.json()
      toast({
        title: "Sprint closed",
        description: "The current sprint has been closed successfully.",
      })
      setIsDialogOpen(false)
      // Refresh data
      window.location.reload()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start sprint",
      })
    }
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

    const updateStatus = async (ticketId: string, status: string | null) => {
      if (!status) {
        throw new Error("Invalid status")
      }
      const response = await fetch(`/api/tickets/${teamId}/${ticketId}?status=${status}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      })
      if (!response.ok) {
        throw new Error("Failed to update ticket")
      }
      toast({
        title: "Ticket updated",
        description: `Ticket moved to ${status}`,
      })
    }

    const updatedTickets = tickets.map((ticket) => {
      if (ticket.id === ticketId) {
        updateStatus(ticketId, status).catch((error) => {
          console.error(error)
          toast({
            title: "Error",
            description: error.message,
          })
        })
        return { ...ticket, status }
      }
      return ticket
    })

    setTickets(updatedTickets)
  }

  const handleTicketClick = (ticket: (typeof tickets)[0]) => {
    setSelectedTicket(ticket)
    setIsPreviewOpen(true)
  }

  const handleSaveTicket = (updatedTicket: TicketFormValues) => {
    // Update the ticket in the tickets array
    //const updatedTickets = tickets.map((ticket) => (ticket.id === updatedTicket.id ? updatedTicket : ticket))
    const updateTicket = async (ticketId: string, updatedTicket: TicketFormValues) => {
      const response = await fetch(`/api/tickets/${teamId}/${ticketId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedTicket),
      })
      if (!response.ok) {
        throw new Error("Failed to update ticket")
      }
      toast({
        title: "Ticket updated",
        description: `Ticket ${ticketId} has been updated successfully.`,
      })
      // Revalidate data after updating ticket
      await mutate()
    }
    updateTicket(selectedTicket.id, updatedTicket).catch((error) => {
      toast({
        title: "Error",
        description: error.message,
      })
    })
    //setTickets(updatedTickets)
  }

  const handleSelectAssignee = (assignee: any | null) => {
    setSelectedAssignee(assignee)

    if (assignee) {
      toast({
        title: "Filter applied",
        description: `Showing tickets assigned to ${assignee.name}`,
      })
    }
  }

  const ticketsByStatus = {
    OPEN: filteredTickets.filter((ticket) => ticket.status === "OPEN"),
    "IN PROGRESS": filteredTickets.filter((ticket) => ticket.status === "IN PROGRESS"),
    BLOCKED: filteredTickets.filter((ticket) => ticket.status === "BLOCKED"),
    CLOSED: filteredTickets.filter((ticket) => ticket.status === "CLOSED"),
  }

  // Calculate ticket counts for the status header
  const totalTickets = filteredTickets.length
  const ticketCounts = {
    OPEN: ticketsByStatus.OPEN.length,
    "IN PROGRESS": ticketsByStatus["IN PROGRESS"].length,
    BLOCKED: ticketsByStatus.BLOCKED.length,
    CLOSED: ticketsByStatus.CLOSED.length,
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
            Showing {totalTickets} ticket{totalTickets !== 1 ? "s" : ""} assigned to {selectedAssignee.name}
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
                      <AvatarImage src={ticket.assignee?.image} alt={ticket.assignee?.name} />
                      <AvatarFallback>{ticket.assignee?.initials}</AvatarFallback>
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

