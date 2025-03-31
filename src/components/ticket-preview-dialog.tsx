"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/src/components/ui/button"
import { Badge } from "@/src/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/src/components/ui/dialog"
import { Textarea } from "@/src/components/ui/textarea"
import { Input } from "@/src/components/ui/input"
import { useToast } from "@/src/components/ui/use-toast"
import {
  Clock,
  MessageSquare,
  Pencil,
  Save,
  X,
  User,
  ExternalLink,
  ChevronUp,
  ChevronDown,
  Trash2,
  AlertTriangle,
} from "lucide-react"
import ReactMarkdown from "react-markdown"
import { ScrollArea } from "@/src/components/ui/scroll-area"
import { Separator } from "@/src/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import { useTeam } from "@/src/contexts/team-provider"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/src/components/ui/form"
import { z } from "zod"
import { ticketSchema } from "@/src/lib/schema"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/src/components/ui/alert-dialog"

// Define comment schema separately
const ticketCommentSchema = z.object({
  id: z.string(),
  author: z.string(),
  content: z.string(),
  createdAt: z.string(),
})

// Comment form schema
const commentFormSchema = z.object({
  content: z.string().min(1, { message: "Comment cannot be empty" }),
})

// Define types based on schemas
type TicketFormValues = z.infer<typeof ticketSchema>
type CommentFormValues = z.infer<typeof commentFormSchema>

interface TicketPreviewDialogProps {
  ticket: any
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit?: (ticket: any) => void
  onSave?: (updatedTicket: any) => void
  onDelete?: (ticketId: string) => void
}

export function TicketPreviewDialog({
  ticket,
  open,
  onOpenChange,
  onEdit,
  onSave,
  onDelete,
}: TicketPreviewDialogProps) {
  const { toast } = useToast()
  const router = useRouter()
  const { teamId } = useTeam()
  const [isEditing, setIsEditing] = useState(false)
  const [editedTicket, setEditedTicket] = useState<any | null>(null)
  const [newTag, setNewTag] = useState("")
  const [commentsExpanded, setCommentsExpanded] = useState(true)
  const [descriptionExpanded, setDescriptionExpanded] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  // Form for ticket editing - uses the imported schema
  const ticketForm = useForm<TicketFormValues>({
    resolver: zodResolver(ticketSchema),
    defaultValues: ticket
      ? {
        title: ticket.title,
        description: ticket.description || "",
        status: ticket.status || "OPEN",
        priority: ticket.priority || "NONE",
        assigneeId: ticket.assigneeId,
        tags: ticket.tags || [],
      }
      : undefined,
  })

  // Form for adding comments
  const commentForm = useForm<CommentFormValues>({
    resolver: zodResolver(commentFormSchema),
    defaultValues: {
      content: "",
    },
  })

  // Update local state and form values when ticket changes
  useEffect(() => {
    if (ticket) {
      setEditedTicket({ ...ticket })
      ticketForm.reset({
        title: ticket.title,
        description: ticket.description || "",
        status: ticket.status || "OPEN",
        priority: ticket.priority || "NONE",
        assigneeId: ticket.assigneeId,
        tags: ticket.tags || [],
      })
    }
  }, [ticket, ticketForm])

  if (!ticket || !editedTicket) return null

  const priorityColors = {
    HIGH: "text-red-500 bg-red-100 dark:bg-red-900/20",
    MEDIUM: "text-yellow-500 bg-yellow-100 dark:bg-yellow-900/20",
    LOW: "text-green-500 bg-green-100 dark:bg-green-900/20",
    NONE: "text-gray-500 bg-gray-100 dark:bg-gray-900/20",
  }

  const statusOptions = ["OPEN", "IN PROGRESS", "BLOCKED", "CLOSED"]
  const priorityOptions = ["NONE", "LOW", "MEDIUM", "HIGH"]
  const assigneeOptions = [
    { name: "John Doe", id: "1" },
    { name: "Joe Dohn", id: "2" },
  ]

  // Format status for display
  const formatStatus = (status: string) => {
    return status
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase())
  }

  const handleAddComment = (data: CommentFormValues) => {
    toast({
      title: "Comment added",
      description: "Your comment has been added to the ticket.",
    })

    commentForm.reset()
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleSave = (data: TicketFormValues) => {
    if (onSave && editedTicket) {
      // Merge form data with existing ticket data
      const updatedTicket = {
        ...editedTicket,
        ...data,
        // Maintain the assignee object structure
        assigneeId: data.assigneeId ? assigneeOptions.find((a) => a.id === data.assigneeId) || null : null,
      }

      onSave(updatedTicket)

      setIsEditing(false)
      setEditedTicket(updatedTicket)
    }
  }

  const handleCancel = () => {
    // Reset to original ticket data
    if (ticket) {
      setEditedTicket({ ...ticket })
      ticketForm.reset({
        title: ticket.title,
        description: ticket.description || "",
        status: ticket.status || "OPEN",
        priority: ticket.priority || "NONE",
        assigneeId: ticket.assigneeId,
        tags: ticket.tags || [],
      })
    }
    setIsEditing(false)
  }

  const handleAddTag = () => {
    if (newTag && ticketForm.getValues().tags && !ticketForm.getValues().tags.includes(newTag)) {
      const currentTags = ticketForm.getValues().tags || []
      if (currentTags.length < 10) {
        ticketForm.setValue("tags", [...currentTags, newTag], { shouldValidate: true })
        setNewTag("")
      } else {
        toast({
          title: "Tag limit reached",
          description: "You can only add up to 10 tags.",
          variant: "destructive",
        })
      }
    }
  }

  const handleRemoveTag = (tag: string) => {
    const currentTags = ticketForm.getValues().tags || []
    ticketForm.setValue(
      "tags",
      currentTags.filter((t) => t !== tag),
      { shouldValidate: true },
    )
  }

  const handleViewFullPage = () => {
    if (teamId && ticket) {
      router.push(`/tickets/${teamId}/${ticket.id}`)
      onOpenChange(false)
    }
  }

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (onDelete && ticket) {
      onDelete(ticket.id)
      setDeleteDialogOpen(false)
      onOpenChange(false)
    }
  }

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(newOpen) => {
          if (!newOpen) {
            // Reset editing state when dialog is closed
            setIsEditing(false)
          }
          onOpenChange(newOpen)
        }}
      >
        <DialogContent className="sm:max-w-[800px] max-h-[85vh] flex flex-col overflow-hidden">
          <DialogHeader>
            <div className="flex mb-0.5">
              <Badge variant="outline" className="text-xs">
                {editedTicket.id}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              {isEditing ? (
                <Form {...ticketForm}>
                  <FormField
                    control={ticketForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input {...field} className="text-xl font-semibold" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </Form>
              ) : (
                <>
                  <DialogTitle className="text-xl flex-1 mr-4">{editedTicket.title}</DialogTitle>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button onClick={handleViewFullPage} variant="ghost" size="icon" title="View Full Page">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button onClick={handleEdit} variant="ghost" size="icon" title="Edit Ticket">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button onClick={handleDeleteClick} variant="ghost" size="icon" title="Delete Ticket">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              )}
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {isEditing ? (
                <div className="w-full space-y-2">
                  <div className="flex gap-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Add a tag"
                      className="flex-1"
                    />
                    <Button type="button" onClick={handleAddTag} variant="outline" size="sm">
                      Add Tag
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {ticketForm.getValues().tags?.map((tag) => (
                      <Badge key={tag} variant="secondary" className="flex items-center gap-1">
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
                  {ticketForm.formState.errors.tags && (
                    <p className="text-sm text-destructive">{ticketForm.formState.errors.tags.message}</p>
                  )}
                </div>
              ) : (
                editedTicket.tags?.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))
              )}
            </div>
          </DialogHeader>

          <ScrollArea className="flex-1 pr-4 overflow-y-auto max-h-[calc(85vh-180px)]">
            <div className="space-y-4">
              {/* Ticket Details Section */}
              <div className="space-y-4">
                {isEditing ? (
                  <Form {...ticketForm}>
                    <div className="grid gap-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={ticketForm.control}
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
                                  {statusOptions.map((status) => (
                                    <SelectItem key={status} value={status}>
                                      {formatStatus(status)}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={ticketForm.control}
                          name="priority"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Priority</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select priority" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {priorityOptions.map((priority) => (
                                    <SelectItem key={priority} value={priority}>
                                      {formatStatus(priority)}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={ticketForm.control}
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
                                <SelectItem value="unassigned">Unassigned</SelectItem>
                                {assigneeOptions.map((assignee) => (
                                  <SelectItem key={assignee.id} value={assignee.id}>
                                    {assignee.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </Form>
                ) : (
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>Assignee: {editedTicket.assigneeId || "Unassigned"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={priorityColors[editedTicket.priority as keyof typeof priorityColors] || ""}
                      >
                        {formatStatus(editedTicket.priority || "NONE")}
                      </Badge>
                      <Badge variant="outline">{formatStatus(editedTicket.status || "OPEN")}</Badge>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Created on {editedTicket.createdAt}</span>
                </div>

                <div className="rounded-md border p-5 bg-muted/30 cursor-pointer">
                  <h3 className="mb-3 text-sm font-medium">Description</h3>
                  {!isEditing ? (
                    <div
                      className={`prose prose-sm max-w-none dark:prose-invert break-words ${!descriptionExpanded ? "max-h-[400px] overflow-hidden relative" : ""}`}
                      onClick={() => setDescriptionExpanded(!descriptionExpanded)}
                    >
                      {editedTicket.description ? (
                        <>
                          <ReactMarkdown>{editedTicket.description}</ReactMarkdown>
                          {!descriptionExpanded && editedTicket.description.length > 300 && (
                            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-background to-transparent flex items-end justify-center pb-1">
                              <Badge variant="outline" className="cursor-pointer">
                                Show more
                              </Badge>
                            </div>
                          )}
                        </>
                      ) : (
                        <p className="text-muted-foreground italic">No description provided</p>
                      )}
                    </div>
                  ) : (
                    <Form {...ticketForm}>
                      <FormField
                        control={ticketForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Textarea
                                {...field}
                                className="min-h-[250px] font-mono text-sm"
                                placeholder="Enter ticket description (supports markdown)"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </Form>
                  )}
                </div>
              </div>

              {/* Comments Section */}
              <div>
                <div
                  className="flex items-center justify-between mb-4 cursor-pointer"
                  onClick={() => setCommentsExpanded(!commentsExpanded)}
                >
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    <h3 className="text-sm font-medium">
                      Comments {editedTicket.comments?.length ? `(${editedTicket.comments.length})` : ""}
                    </h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      setCommentsExpanded(!commentsExpanded)
                    }}
                  >
                    {commentsExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </div>

                <Separator className="my-4" />

                {commentsExpanded && (
                  <div className="space-y-4 transition-all duration-300 ease-in-out">
                    {editedTicket.comments && editedTicket.comments.length > 0 ? (
                      editedTicket.comments.map((comment) => (
                        <div key={comment.id} className="rounded-md border p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-medium">{comment.author}</div>
                            <div className="text-xs text-muted-foreground">{comment.createdAt}</div>
                          </div>
                          <p className="text-sm break-words">{comment.content}</p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <MessageSquare className="mx-auto h-8 w-8 mb-2" />
                        <p>No comments yet</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>

          <div className="space-y-2 mt-4">
            {!isEditing && (
              <>
                <Form {...commentForm}>
                  <form onSubmit={commentForm.handleSubmit(handleAddComment)}>
                    <FormField
                      control={commentForm.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Textarea {...field} placeholder="Add a comment..." className="min-h-[80px] resize-none" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-between mt-2">
                      <Button variant="outline" onClick={() => onOpenChange(false)} type="button">
                        Close
                      </Button>
                      <div className="flex gap-2">
                        <Button type="submit">Add Comment</Button>
                      </div>
                    </div>
                  </form>
                </Form>
              </>
            )}

            {isEditing && (
              <div className="flex justify-between border-t pt-4">
                <Button variant="outline" onClick={handleCancel}>
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button onClick={ticketForm.handleSubmit(handleSave)} variant="default">
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Confirm Deletion
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this ticket? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

