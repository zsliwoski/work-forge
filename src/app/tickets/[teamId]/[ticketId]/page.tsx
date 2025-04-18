"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/src/components/ui/button"
import { Badge } from "@/src/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Textarea } from "@/src/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { Separator } from "@/src/components/ui/separator"
import { ScrollArea } from "@/src/components/ui/scroll-area"
import { useToast } from "@/src/components/ui/use-toast"
import { ArrowLeft, Clock, MessageSquare, Tag } from "lucide-react"
import ReactMarkdown from "react-markdown"
import useSWR from "swr"
import { fetcher } from "@/src/lib/db"
import { Spinner } from "@/src/components/ui/spinner"

// Mock ticket data - in a real app, this would come from an API
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
  // ... other tickets would be here
]

export default function TicketPage({ params }: { params: { teamId: string; ticketId: string } }) {
  const { teamId, ticketId } = params
  const router = useRouter()
  const { toast } = useToast()
  const [ticket, setTicket] = useState<any>(null)
  const [newComment, setNewComment] = useState("")
  const [pageLoading, setpageLoading] = useState(true)

  const { data, error, isLoading } = useSWR(`/api/tickets/${teamId}/${ticketId}`, fetcher, { revalidateOnFocus: false });

  if (isLoading) return <Spinner className="absolute top-1/2 left-1/2" />
  if (error) return <div>Error loading ticket</div>
  if (data && !ticket) {
    console.log(data)
    setTicket(data)
    setpageLoading(false)
  }

  const handleAddComment = () => {
    if (!newComment.trim()) return

    // In a real app, this would be an API call
    const newCommentObj = {
      id: `comment-${Date.now()}`,
      author: "John Doe",
      content: newComment,
      createdAt: new Date().toISOString().split("T")[0],
    }

    setTicket({
      ...ticket,
      comments: [...(ticket.comments || []), newCommentObj],
    })

    setNewComment("")

    toast({
      title: "Comment added",
      description: "Your comment has been added to the ticket.",
    })
  }

  const handleBackToTickets = () => {
    if (teamId) {
      router.push(`/tickets/${teamId}`)
    }
  }

  if (pageLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading ticket...</p>
        </div>
      </div>
    )
  }

  if (!ticket) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <h2 className="text-2xl font-bold mb-4">Ticket Not Found</h2>
        <p className="text-muted-foreground mb-6">The ticket you're looking for doesn't exist or has been moved.</p>
        <Button onClick={handleBackToTickets}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Tickets
        </Button>
      </div>
    )
  }

  const priorityColors = {
    NONE: "text-black-500 bg-white-100 dark:bg-black-900/20 dark:text-white-500",
    LOW: "text-green-500 bg-green-100 dark:bg-green-900/20",
    MEDIUM: "text-yellow-500 bg-yellow-100 dark:bg-yellow-900/20",
    HIGH: "text-red-500 bg-red-100 dark:bg-red-900/20",
  }

  const priorityLabels = { NONE: "None", LOW: "Low", MEDIUM: "Medium", HIGH: "High" }

  return (
    <div className="container max-w-4xl py-8">
      <Button variant="ghost" onClick={handleBackToTickets} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Tickets
      </Button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <Badge variant="outline" className="mb-2" title="Ticket ID">{ticket.id}</Badge>
          <h1 className="text-3xl font-bold">{ticket.title}</h1>
          <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground" title={`Created at ${ticket.createdAt}`}>
            <Clock className="h-4 w-4" />
            <span>Created on {ticket.createdAt.split('T')[0]}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <ReactMarkdown>{ticket.description}</ReactMarkdown>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center">
              <CardTitle>Comments</CardTitle>
              <Badge variant="outline" className="ml-2">
                {ticket.comments?.length || 0}
              </Badge>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] pr-4">
                {ticket.comments && ticket.comments.length > 0 ? (
                  <div className="space-y-4">
                    {ticket.comments.map((comment: any) => (
                      <div key={comment.id} className="rounded-md border p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium">{comment.author}</div>
                          <div className="text-xs text-muted-foreground">{comment.createdAt}</div>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="mx-auto h-8 w-8 mb-2" />
                    <p>No comments yet</p>
                  </div>
                )}
              </ScrollArea>

              <Separator className="my-4" />

              <div className="space-y-4">
                <Textarea
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="min-h-[100px] resize-none"
                />
                <Button onClick={handleAddComment}>Add Comment</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Status</span>
                <Badge variant="outline">{ticket.status}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Priority</span>
                <Badge variant="outline" className={priorityColors[ticket.priority as keyof typeof priorityColors]}>
                  {priorityLabels[ticket.priority as keyof typeof priorityLabels]}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Assignee</span>
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={ticket.assignee?.image} alt={ticket.assignee?.name} />
                    <AvatarFallback>{ticket.assignee?.name[0]}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{ticket.assignee?.name}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {ticket.tags?.map((tag: string) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {ticket.tags?.length === 0 && (
                  <div className="text-center py-2 text-muted-foreground">
                    <Tag className="mx-auto h-4 w-4 mb-1" />
                    <p className="text-xs">No tags</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

