"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { Clock, MessageSquare, Pencil, Save, X, User, Tag, ExternalLink } from "lucide-react"
import ReactMarkdown from "react-markdown"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useTeam } from "@/contexts/team-provider"

interface TicketComment {
  id: string
  author: string
  content: string
  createdAt: string
}
interface User {
  id: string
  name: string
  image: string
}
interface Ticket {
  id: string
  title: string
  description: string
  status: string
  priority: string
  assignee: User | null
  tags: string[]
  createdAt?: string
  comments?: TicketComment[]
}

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
  const [newComment, setNewComment] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [editedTicket, setEditedTicket] = useState<Ticket | null>(null)
  const [newTag, setNewTag] = useState("")

  // Update local state when ticket changes
  useEffect(() => {
    if (ticket) {
      setEditedTicket({ ...ticket })
    }
  }, [ticket])

  if (!ticket || !editedTicket) return null

  const priorityColors = {
    High: "text-red-500 bg-red-100 dark:bg-red-900/20",
    Medium: "text-yellow-500 bg-yellow-100 dark:bg-yellow-900/20",
    Low: "text-green-500 bg-green-100 dark:bg-green-900/20",
  }

  const statusOptions = ["Todo", "In Progress", "Blocked", "Done", "Current Sprint", "Next Sprint", "Backlog"]
  const priorityOptions = ["High", "Medium", "Low", "None"]
  const assigneeOptions = [{ name: "John Doe", id: "1" }, { name: "Joe Dohn", id: "2" }]

  const handleAddComment = () => {
    if (!newComment.trim()) return

    toast({
      title: "Comment added",
      description: "Your comment has been added to the ticket.",
    })

    setNewComment("")
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleSave = () => {
    if (onSave && editedTicket) {
      onSave(editedTicket)

      toast({
        title: "Ticket updated",
        description: `Ticket ${editedTicket.id} has been updated successfully.`,
      })

      setIsEditing(false)
    }
  }

  const handleCancel = () => {
    // Reset to original ticket data
    if (ticket) {
      setEditedTicket({ ...ticket })
    }
    setIsEditing(false)
  }

  const handleAddTag = () => {
    if (newTag && editedTicket && !editedTicket.tags.includes(newTag)) {
      setEditedTicket({
        ...editedTicket,
        tags: [...editedTicket.tags, newTag],
      })
      setNewTag("")
    }
  }

  const handleRemoveTag = (tag: string) => {
    if (editedTicket) {
      setEditedTicket({
        ...editedTicket,
        tags: editedTicket.tags.filter((t) => t !== tag),
      })
    }
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
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            {isEditing ? (
              <Input
                value={editedTicket.title}
                onChange={(e) => setEditedTicket({ ...editedTicket, title: e.target.value })}
                className="text-xl font-semibold"
              />
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

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            {/* Ticket Details Section */}
            <div className="space-y-4">
              {isEditing ? (
                <div className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={editedTicket.status}
                        onValueChange={(value) => setEditedTicket({ ...editedTicket, status: value })}
                      >
                        <SelectTrigger id="status">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="priority">Priority</Label>
                      <Select
                        value={editedTicket.priority}
                        onValueChange={(value) => setEditedTicket({ ...editedTicket, priority: value })}
                      >
                        <SelectTrigger id="priority">
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          {priorityOptions.map((priority) => (
                            <SelectItem key={priority} value={priority}>
                              {priority}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="assignee">Assignee</Label>
                    <Select
                      value={editedTicket.assignee?.name}
                      onValueChange={(value) => setEditedTicket({ ...editedTicket, assignee: value })}
                    >
                      <SelectTrigger id="assignee">
                        <SelectValue placeholder="Select assignee" />
                      </SelectTrigger>
                      <SelectContent>
                        {assigneeOptions.map((assignee) => (
                          <SelectItem key={assignee.id} value={assignee.id}>
                            {assignee.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
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
                  <Textarea
                    value={editedTicket.description}
                    onChange={(e) => setEditedTicket({ ...editedTicket, description: e.target.value })}
                    className="min-h-[150px] font-mono text-sm"
                    placeholder="Enter ticket description (supports markdown)"
                  />
                ) : (
                  <div className="prose prose-sm max-w-none dark:prose-invert break-words">
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

              <div className="space-y-4">
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
              <Textarea
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[80px] resize-none"
              />
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Close
                </Button>
                <div className="flex gap-2">
                  <Button onClick={handleViewFullPage} variant="outline">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View Full Page
                  </Button>
                  <Button onClick={handleAddComment}>Add Comment</Button>
                  <Button onClick={handleEdit} variant="secondary">
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit Ticket
                  </Button>
                </div>
              </div>
            </>
          )}

          {isEditing && (
            <div className="flex justify-between border-t pt-4">
              <Button variant="outline" onClick={handleCancel}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button onClick={handleSave} variant="default">
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </div>
          )}
        </div>
      </DialogContent >
    </Dialog >
  )
}

