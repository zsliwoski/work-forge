"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/src/components/ui/button"
import { Badge } from "@/src/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/src/components/ui/dialog"
import { Textarea } from "@/src/components/ui/textarea"
import { Input } from "@/src/components/ui/input"
import { useToast } from "@/src/components/ui/use-toast"
import { Clock, MessageSquare, Pencil, Save, X, User, ExternalLink } from "lucide-react"
import ReactMarkdown from "react-markdown"
import { ScrollArea } from "@/src/components/ui/scroll-area"
import { Separator } from "@/src/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import { useTeam } from "@/src/contexts/team-provider"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/src/components/ui/form"

// Define Zod schemas for validation
const ticketCommentSchema = z.object({
  id: z.string(),
  author: z.string(),
  content: z.string(),
  createdAt: z.string(),
})

const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  image: z.string(),
})

const ticketSchema = z.object({
  id: z.string(),
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  status: z
    .string()
    .refine(
      (val) => ["Todo", "In Progress", "Blocked", "Done"].includes(val),
      {
        message: "Please select a valid status",
      },
    ),
  priority: z.string().refine((val) => ["High", "Medium", "Low", "None"].includes(val), {
    message: "Please select a valid priority",
  }),
  assignee: userSchema.nullable(),
  tags: z.array(z.string()),
  createdAt: z.string().optional(),
  comments: z.array(ticketCommentSchema).optional(),
})

const commentFormSchema = z.object({
  content: z.string().min(1, { message: "Comment cannot be empty" }),
})

type TicketComment = z.infer<typeof ticketCommentSchema>
type TicketUser = z.infer<typeof userSchema>
type Ticket = z.infer<typeof ticketSchema>
type CommentFormValues = z.infer<typeof commentFormSchema>

interface TicketPreviewDialogProps {
  ticket: Ticket | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit?: (ticket: Ticket) => void
  onSave?: (updatedTicket: Ticket) => void
}

export function TicketPreviewDialog({ ticket, open, onOpenChange, onEdit, onSave }: TicketPreviewDialogProps) {
  const { toast } = useToast()
  const router = useRouter()
  const { teamId } = useTeam()
  const [isEditing, setIsEditing] = useState(false)
  const [editedTicket, setEditedTicket] = useState<Ticket | null>(null)
  const [newTag, setNewTag] = useState("")

  // Form for ticket editing
  const ticketForm = useForm<Ticket>({
    resolver: zodResolver(ticketSchema),
    defaultValues: ticket || undefined,
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
      ticketForm.reset(ticket)
    }
  }, [ticket, ticketForm])

  if (!ticket || !editedTicket) return null

  const priorityColors = {
    High: "text-red-500 bg-red-100 dark:bg-red-900/20",
    Medium: "text-yellow-500 bg-yellow-100 dark:bg-yellow-900/20",
    Low: "text-green-500 bg-green-100 dark:bg-green-900/20",
  }

  const statusOptions = ["Todo", "In Progress", "Blocked", "Done", "Current Sprint", "Next Sprint", "Backlog"]
  const priorityOptions = ["High", "Medium", "Low", "None"]
  const assigneeOptions = [
    { name: "John Doe", id: "1" },
    { name: "Joe Dohn", id: "2" },
  ]

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

  const handleSave = (data: Ticket) => {
    if (onSave) {
      onSave(data)

      toast({
        title: "Ticket updated",
        description: `Ticket ${data.id} has been updated successfully.`,
      })

      setIsEditing(false)
    }
  }

  const handleCancel = () => {
    // Reset to original ticket data
    if (ticket) {
      setEditedTicket({ ...ticket })
      ticketForm.reset(ticket)
    }
    setIsEditing(false)
  }

  const handleAddTag = () => {
    if (newTag && !ticketForm.getValues().tags.includes(newTag)) {
      const currentTags = ticketForm.getValues().tags || []
      ticketForm.setValue("tags", [...currentTags, newTag], { shouldValidate: true })
      setNewTag("")
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

  return (
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
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            {isEditing ? (
              <Form {...ticketForm}>
                <FormField
                  control={ticketForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input {...field} className="text-xl font-semibold" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Form>
            ) : (
              <DialogTitle className="text-xl">{editedTicket.title}</DialogTitle>
            )}
            <Badge variant="outline">{editedTicket.id}</Badge>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {/*isEditing ? (
              <div className="w-full space-y-2">
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add a tag"
                    className="flex-1"
                  />
                  <Button type="button" onClick={handleAddTag} variant="outline" size="sm">
                    <Tag className="h-4 w-4 mr-1" /> Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {editedTicket.tags.map((tag) => (
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
              </div>
            ) : (
              editedTicket.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))
            )*/}
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
                                    {status}
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
                                    {priority}
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
                      name="assignee"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Assignee</FormLabel>
                          <Select
                            onValueChange={(value) => {
                              const assignee = assigneeOptions.find((a) => a.id === value)
                              if (assignee) {
                                field.onChange({
                                  id: assignee.id,
                                  name: assignee.name,
                                  image: "",
                                })
                              } else {
                                field.onChange(null)
                              }
                            }}
                            defaultValue={field.value?.id}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select assignee" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
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
                    <span>Assignee: {editedTicket.assignee?.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={priorityColors[editedTicket.priority as keyof typeof priorityColors]}
                    >
                      {editedTicket.priority}
                    </Badge>
                    <Badge variant="outline">{editedTicket.status}</Badge>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Created on {editedTicket.createdAt}</span>
              </div>

              <div className="rounded-md border p-4">
                <h3 className="mb-2 text-sm font-medium">Description</h3>
                {isEditing ? (
                  <Form {...ticketForm}>
                    <FormField
                      control={ticketForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Textarea
                              {...field}
                              className="min-h-[150px] font-mono text-sm"
                              placeholder="Enter ticket description (supports markdown)"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </Form>
                ) : (
                  <div className="prose prose-sm max-w-none dark:prose-invert break-words max-h-[200px] overflow-y-auto">
                    <ReactMarkdown>{editedTicket.description}</ReactMarkdown>
                  </div>
                )}
              </div>
            </div>

            {/* Comments Section */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="h-4 w-4" />
                <h3 className="text-sm font-medium">Comments</h3>
              </div>
              <Separator className="my-4" />

              <div className="space-y-4 overflow-y-auto">
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
                      <Button onClick={handleViewFullPage} variant="outline" type="button">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View Full Page
                      </Button>
                      <Button type="submit">Add Comment</Button>
                      <Button onClick={handleEdit} variant="secondary" type="button">
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit Ticket
                      </Button>
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
  )
}

