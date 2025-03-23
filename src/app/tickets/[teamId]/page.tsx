"use client"

import type React from "react"

import { use, useState, useEffect } from "react"
import useSWR from 'swr'

import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Input } from "@/src/components/ui/input"
import { Badge } from "@/src/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import { Textarea } from "@/src/components/ui/textarea"
import { useToast } from "@/src/components/ui/use-toast"
import { AlertCircle, ChevronDown, ChevronUp, Clock, Plus, Search } from "lucide-react"
import { TicketPreviewDialog } from "@/src/components/ticket-preview-dialog"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/src/components/ui/form"
import { ticketSchema } from "@/src/lib/schema"
import { fetcher } from "@/src/lib/db"


type TicketFormValues = z.infer<typeof ticketSchema>

// Update the priorityColors object to use solid background colors for the priority bars
const priorityColors = {
  High: "bg-red-500",
  Medium: "bg-yellow-500",
  Low: "bg-green-500",
  NONE: "bg-gray-500",
}

export default function TicketsPage({ params }: { params: { teamId: string } }) {
  const { toast } = useToast()
  const { teamId } = params

  //const [tickets, setTickets] = useState(mockTickets)
  const [selectedTicket, setSelectedTicket] = useState<(typeof tickets)[0] | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [newTag, setNewTag] = useState("")
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    "Current Sprint": true,
    "Next Sprint": true,
    Backlog: true,
  })
  const [sprintMap, setSprintMap] = useState<Record<string, string | null>>({
    "Current Sprint": null,
    "Next Sprint": null,
    Backlog: null
  })

  // Replace the newTicket state with form handling
  const form = useForm<TicketFormValues>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "NONE",
      tags: [],
    },
  })

  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const { data, error, isLoading } = useSWR(`/api/tickets/${teamId}`, fetcher, { revalidateOnFocus: false });
  useEffect(() => {
    if (data) {
      const sprints = { "Current Sprint": data.team.currentSprintId, "Next Sprint": data.team.nextSprintId, Backlog: null }
      setSprintMap(sprints)
    }
  }, [data])


  if (error) return <div>Failed to load</div>
  if (isLoading) return <div>Loading...</div>
  if (data) {

  }
  const currentSprint = data.team.currentSprintId
  const nextSprint = data.team.nextSprintId
  const tickets = data.tickets

  const filteredTickets = tickets.filter(
    (ticket) =>
      ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.id.toLowerCase().includes(searchQuery.toLowerCase()),
  )
  console.log(filteredTickets)

  const handleCreateTicket = (values: TicketFormValues) => {

    fetch(`/api/tickets/${teamId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to create ticket")
        }
        return response.json()
      })
      .then((data) => {
        const id = data.id
        const createdAt = new Date().toISOString().split("T")[0]

        /*setTickets([
          ...tickets,
          {
            ...values,
            id,
            createdAt,
            tags: values.tags || [],
          },
        ])*/

        form.reset({
          title: "",
          description: "",
          priority: "NONE",
          assigneeId: undefined,
          tags: [],
        })

        setIsDialogOpen(false)

        toast({
          title: "Ticket created",
          description: `Ticket ${id} has been created successfully.`,
        })
      })
      .catch((error) => {
        toast({
          title: "Error",
          description: error.message,
        })
      })
  }

  const handleAddTag = () => {
    if (newTag && !form.getValues().tags.includes(newTag)) {
      const currentTags = form.getValues().tags || []
      form.setValue("tags", [...currentTags, newTag])
      setNewTag("")
    }
  }

  const handleRemoveTag = (tag: string) => {
    const currentTags = form.getValues().tags || []
    form.setValue(
      "tags",
      currentTags.filter((t) => t !== tag),
    )
  }

  const handleTicketClick = (ticket: (typeof tickets)[0]) => {
    if (teamId && ticket.id) {
      // For direct navigation, uncomment this:
      // router.push(`/${selectedTeam.id}/tickets/${ticket.id}`)

      // For dialog preview, keep this:
      setSelectedTicket(ticket)
      setIsPreviewOpen(true)
    }
  }

  const handleSaveTicket = (updatedTicket: (typeof tickets)[0]) => {
    // Update the ticket in the tickets array
    const updatedTickets = tickets.map((ticket) => (ticket.id === updatedTicket.id ? updatedTicket : ticket))

    //setTickets(updatedTickets)
  }

  const handleDragStart = (e: React.DragEvent, ticketId: string) => {
    e.dataTransfer.setData("ticketId", ticketId)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, sprint: string) => {
    e.preventDefault()

    const updateSprint = async (ticketId: string, sprintId: string | null) => {
      if (!sprintId) {
        throw new Error("Invalid sprint ID")
      }
      const response = await fetch(`/api/tickets/${teamId}/${ticketId}?sprintId=${sprintId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sprintId }),
      })
      if (!response.ok) {
        throw new Error("Failed to update ticket")
      }
    }

    const ticketId = e.dataTransfer.getData("ticketId")
    const sprintId = sprint === "Backlog" ? null : sprintMap[sprint]
    const updatedTickets = tickets.map((ticket) => {
      if (ticket.id === ticketId) {
        updateSprint(ticketId, sprintId).catch((error) => {
          toast({
            title: "Error",
            description: error.message,
          })
        })
        return { ...ticket, sprintId }
      }
      return ticket
    })
  }

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }))
  }

  const ticketsBySprintId = {
    "Current Sprint": currentSprint ? filteredTickets.filter((ticket) => ticket.sprintId === currentSprint) : [],
    "Next Sprint": nextSprint ? filteredTickets.filter((ticket) => ticket.sprintId === nextSprint) : [],
    Backlog: filteredTickets.filter((ticket) => ticket.sprintId === null),
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
          <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Ticket</DialogTitle>
              <DialogDescription>Fill in the details to create a new ticket.</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleCreateTicket)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter ticket title" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Enter ticket description (supports markdown)"
                          className="min-h-[120px] resize-none"
                        />
                      </FormControl>
                      <FormDescription>Supports markdown formatting</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  {/*<FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Current Sprint">Current Sprint</SelectItem>
                            <SelectItem value="Next Sprint">Next Sprint</SelectItem>
                            <SelectItem value="Backlog">Backlog</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />*/}
                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priority</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={"NONE"}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="NONE">None</SelectItem>
                            <SelectItem value="LOW">Low</SelectItem>
                            <SelectItem value="MEDIUM">Medium</SelectItem>
                            <SelectItem value="HIGH">High</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="assigneeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assignee</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select assignee" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="cm84o8phr0000vwkgc89mrjhj">John Doe</SelectItem>
                          <SelectItem value="Jane Smith">Jane Smith</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/*<FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tags</FormLabel>
                      <div className="flex gap-2">
                        <Input value={newTag} onChange={(e) => setNewTag(e.target.value)} placeholder="Add a tag" />
                        <Button type="button" onClick={handleAddTag} variant="outline">
                          Add
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {field.value?.map((tag) => (
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
                      <FormMessage />
                    </FormItem>
                  )}
                />*/}
                <div className="flex justify-between mt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Ticket</Button>
                </div>
              </form>
            </Form>
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
        {Object.entries(ticketsBySprintId).map(([sprintId, sprintIdTickets]) => (
          <Card key={sprintId} className="flex flex-col">
            <CardHeader
              className="pb-2 cursor-pointer flex flex-row items-center justify-between"
              onClick={() => toggleCategory(sprintId)}
            >
              <div className="flex items-center">
                <CardTitle className="text-lg">{sprintId}</CardTitle>
                <Badge variant="outline" className="ml-2">
                  {sprintIdTickets.length} ticket{sprintIdTickets.length !== 1 ? "s" : ""}
                </Badge>
              </div>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                {expandedCategories[sprintId] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CardHeader>
            {expandedCategories[sprintId] && (
              <CardContent
                className="flex-1 overflow-auto"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, sprintId)}
              >
                <div className="space-y-4">
                  {sprintIdTickets.map((ticket) => (
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
                        {ticket.createdAt.split("T")[0]}
                      </div>

                      {/* User avatar */}
                      {/*<div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                        {ticket.assignee
                          .split(" ")
                          .map((name) => name[0])
                          .join("")}
                      </div>*/}
                    </div>
                  ))}
                  {sprintIdTickets.length === 0 && (
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
        onSave={handleSaveTicket}
      />
    </div>
  )
}

