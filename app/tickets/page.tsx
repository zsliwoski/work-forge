"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { AlertCircle, ChevronDown, ChevronUp, Clock, Plus, Search } from "lucide-react"
import { TicketPreviewDialog } from "@/components/ticket-preview-dialog"

// Mock ticket data
const mockTickets = [
  {
    id: "TICKET-001",
    title: "Implement user authentication",
    description: "Add login and registration functionality with JWT authentication",
    status: "Current Sprint",
    priority: "High",
    assignee: "John Doe",
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
    status: "Current Sprint",
    priority: "Medium",
    assignee: "Jane Smith",
    tags: ["Frontend", "UI/UX"],
    createdAt: "2023-08-16",
  },
  {
    id: "TICKET-003",
    title: "Implement API endpoints for tickets",
    description: "Create RESTful API endpoints for ticket CRUD operations",
    status: "Current Sprint",
    priority: "High",
    assignee: "John Doe",
    tags: ["Backend", "API"],
    createdAt: "2023-08-17",
  },
  {
    id: "TICKET-004",
    title: "Add markdown support for wiki",
    description: "Implement markdown rendering for wiki pages",
    status: "Next Sprint",
    priority: "Medium",
    assignee: "Jane Smith",
    tags: ["Frontend", "Feature"],
    createdAt: "2023-08-18",
  },
  {
    id: "TICKET-005",
    title: "Implement drag and drop for sprint board",
    description: "Add drag and drop functionality for moving tickets between columns",
    status: "Next Sprint",
    priority: "Low",
    assignee: "John Doe",
    tags: ["Frontend", "UX"],
    createdAt: "2023-08-19",
  },
  {
    id: "TICKET-006",
    title: "Set up CI/CD pipeline",
    description: "Configure GitHub Actions for continuous integration and deployment",
    status: "Backlog",
    priority: "Medium",
    assignee: "Jane Smith",
    tags: ["DevOps", "Infrastructure"],
    createdAt: "2023-08-20",
  },
  {
    id: "TICKET-007",
    title: "Implement user roles and permissions",
    description: "Add role-based access control for different user types",
    status: "Backlog",
    priority: "High",
    assignee: "John Doe",
    tags: ["Backend", "Security"],
    createdAt: "2023-08-21",
  },
  {
    id: "TICKET-008",
    title: "Add dark mode support",
    description: "Implement dark mode toggle and theme persistence",
    status: "Backlog",
    priority: "Low",
    assignee: "Jane Smith",
    tags: ["Frontend", "UI"],
    createdAt: "2023-08-22",
  },
]

// Update the priorityColors object to use solid background colors for the priority bars
const priorityColors = {
  High: "bg-red-500",
  Medium: "bg-yellow-500",
  Low: "bg-green-500",
}

export default function TicketsPage() {
  const { toast } = useToast()
  const [tickets, setTickets] = useState(mockTickets)
  const [searchQuery, setSearchQuery] = useState("")
  const [newTicket, setNewTicket] = useState({
    title: "",
    description: "",
    status: "Backlog",
    priority: "Medium",
    assignee: "John Doe",
    tags: [],
  })
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newTag, setNewTag] = useState("")
  const [selectedTicket, setSelectedTicket] = useState<(typeof tickets)[0] | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    "Current Sprint": true,
    "Next Sprint": true,
    Backlog: true,
  })

  const filteredTickets = tickets.filter(
    (ticket) =>
      ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.id.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleCreateTicket = () => {
    const id = `TICKET-${String(tickets.length + 1).padStart(3, "0")}`
    const createdAt = new Date().toISOString().split("T")[0]

    setTickets([
      ...tickets,
      {
        ...newTicket,
        id,
        createdAt,
        tags: newTicket.tags || [],
      },
    ])

    setNewTicket({
      title: "",
      description: "",
      status: "Backlog",
      priority: "Medium",
      assignee: "John Doe",
      tags: [],
    })

    setIsDialogOpen(false)

    toast({
      title: "Ticket created",
      description: `Ticket ${id} has been created successfully.`,
    })
  }

  const handleAddTag = () => {
    if (newTag && !newTicket.tags.includes(newTag)) {
      setNewTicket({
        ...newTicket,
        tags: [...newTicket.tags, newTag],
      })
      setNewTag("")
    }
  }

  const handleRemoveTag = (tag: string) => {
    setNewTicket({
      ...newTicket,
      tags: newTicket.tags.filter((t) => t !== tag),
    })
  }

  const handleTicketClick = (ticket: (typeof tickets)[0]) => {
    setSelectedTicket(ticket)
    setIsPreviewOpen(true)
  }

  const handleEditTicket = (ticket: (typeof tickets)[0]) => {
    // In a real app, this would open the edit form with the ticket data
    toast({
      title: "Edit ticket",
      description: `Editing ticket ${ticket.id}`,
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

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }))
  }

  const ticketsByStatus = {
    "Current Sprint": filteredTickets.filter((ticket) => ticket.status === "Current Sprint"),
    "Next Sprint": filteredTickets.filter((ticket) => ticket.status === "Next Sprint"),
    Backlog: filteredTickets.filter((ticket) => ticket.status === "Backlog"),
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Tickets</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> New Ticket
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[85vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>Create New Ticket</DialogTitle>
              <DialogDescription>Fill in the details to create a new ticket.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newTicket.title}
                  onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                  placeholder="Enter ticket title"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                  placeholder="Enter ticket description (supports markdown)"
                  className="min-h-[120px] resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={newTicket.status}
                    onValueChange={(value) => setNewTicket({ ...newTicket, status: value })}
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Current Sprint">Current Sprint</SelectItem>
                      <SelectItem value="Next Sprint">Next Sprint</SelectItem>
                      <SelectItem value="Backlog">Backlog</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={newTicket.priority}
                    onValueChange={(value) => setNewTicket({ ...newTicket, priority: value })}
                  >
                    <SelectTrigger id="priority">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="assignee">Assignee</Label>
                <Select
                  value={newTicket.assignee}
                  onValueChange={(value) => setNewTicket({ ...newTicket, assignee: value })}
                >
                  <SelectTrigger id="assignee">
                    <SelectValue placeholder="Select assignee" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="John Doe">John Doe</SelectItem>
                    <SelectItem value="Jane Smith">Jane Smith</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="tags">Tags</Label>
                <div className="flex gap-2">
                  <Input id="tags" value={newTag} onChange={(e) => setNewTag(e.target.value)} placeholder="Add a tag" />
                  <Button type="button" onClick={handleAddTag} variant="outline">
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {newTicket.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="flex items-center gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 rounded-full text-muted-foreground hover:text-foreground"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-between mt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={handleCreateTicket}>
                Create Ticket
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search tickets..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-6">
        {Object.entries(ticketsByStatus).map(([status, statusTickets]) => (
          <Card key={status} className="flex flex-col">
            <CardHeader
              className="pb-2 cursor-pointer flex flex-row items-center justify-between"
              onClick={() => toggleCategory(status)}
            >
              <div className="flex items-center">
                <CardTitle className="text-lg">{status}</CardTitle>
                <Badge variant="outline" className="ml-2">
                  {statusTickets.length} ticket{statusTickets.length !== 1 ? "s" : ""}
                </Badge>
              </div>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                {expandedCategories[status] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CardHeader>
            {expandedCategories[status] && (
              <CardContent
                className="flex-1 overflow-auto"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, status)}
              >
                <div className="space-y-4">
                  {statusTickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="flex items-center rounded-md border p-2 shadow-sm cursor-pointer hover:border-primary transition-colors"
                      onClick={() => handleTicketClick(ticket)}
                      draggable
                      onDragStart={(e) => handleDragStart(e, ticket.id)}
                    >
                      {/* Priority indicator bar */}
                      <div
                        className={`w-1 h-full self-stretch rounded-sm mr-2 ${priorityColors[ticket.priority as keyof typeof priorityColors]}`}
                        aria-label={`Priority: ${ticket.priority}`}
                      />

                      {/* Ticket title */}
                      <div className="flex-1 min-w-0 font-medium text-sm truncate">{ticket.title}</div>

                      {/* Ticket number */}
                      <div className="text-xs text-muted-foreground mx-2 whitespace-nowrap">{ticket.id}</div>

                      {/* Creation date */}
                      <div className="text-xs text-muted-foreground mr-2 hidden sm:block whitespace-nowrap">
                        <Clock className="h-3 w-3 inline mr-1" />
                        {ticket.createdAt}
                      </div>

                      {/* User avatar */}
                      <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                        {ticket.assignee
                          .split(" ")
                          .map((name) => name[0])
                          .join("")}
                      </div>
                    </div>
                  ))}
                  {statusTickets.length === 0 && (
                    <div className="flex items-center justify-center rounded-lg border border-dashed p-4 text-center">
                      <AlertCircle className="h-4 w-4 text-muted-foreground mr-2" />
                      <p className="text-sm text-muted-foreground">No tickets found</p>
                    </div>
                  )}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      <TicketPreviewDialog
        ticket={selectedTicket}
        open={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
        onEdit={handleEditTicket}
      />
    </div>
  )
}

