"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Clock, MessageSquare, Pencil, User } from "lucide-react"
import ReactMarkdown from "react-markdown"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

interface TicketComment {
  id: string
  author: string
  content: string
  createdAt: string
}

interface Ticket {
  id: string
  title: string
  description: string
  status: string
  priority: string
  assignee: string
  tags: string[]
  createdAt?: string
  comments?: TicketComment[]
}

interface TicketPreviewDialogProps {
  ticket: Ticket | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit?: (ticket: Ticket) => void
}

export function TicketPreviewDialog({ ticket, open, onOpenChange, onEdit }: TicketPreviewDialogProps) {
  const { toast } = useToast()
  const [newComment, setNewComment] = useState("")

  if (!ticket) return null

  const priorityColors = {
    High: "text-red-500 bg-red-100 dark:bg-red-900/20",
    Medium: "text-yellow-500 bg-yellow-100 dark:bg-yellow-900/20",
    Low: "text-green-500 bg-green-100 dark:bg-green-900/20",
  }

  const handleAddComment = () => {
    if (!newComment.trim()) return

    toast({
      title: "Comment added",
      description: "Your comment has been added to the ticket.",
    })

    setNewComment("")
  }

  const handleEdit = () => {
    if (onEdit) {
      onEdit(ticket)
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">{ticket.title}</DialogTitle>
            <Badge variant="outline">{ticket.id}</Badge>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {ticket.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            {/* Ticket Details Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>Assignee: {ticket.assignee}</span>
                </div>
                <Badge variant="outline" className={priorityColors[ticket.priority as keyof typeof priorityColors]}>
                  {ticket.priority}
                </Badge>
              </div>

              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Created on {ticket.createdAt}</span>
              </div>

              <div className="rounded-md border p-4">
                <h3 className="mb-2 text-sm font-medium">Description</h3>
                <div className="prose prose-sm max-w-none dark:prose-invert break-words">
                  <ReactMarkdown>{ticket.description}</ReactMarkdown>
                </div>
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
                {ticket.comments && ticket.comments.length > 0 ? (
                  ticket.comments.map((comment) => (
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
              <Button onClick={handleAddComment}>Add Comment</Button>
              <Button onClick={handleEdit} variant="secondary">
                <Pencil className="mr-2 h-4 w-4" />
                Edit Ticket
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

