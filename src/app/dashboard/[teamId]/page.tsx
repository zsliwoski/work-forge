"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { CheckCircle, Clock, FileText, Ticket, Users } from "lucide-react"
import { TicketPreviewDialog } from "@/src/components/ticket-preview-dialog"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Sector,
} from "recharts"
import { useUser } from "@/src/contexts/user-provider"
import useSWR from "swr"
import { fetcher } from "@/src/lib/db"

// Mock ticket data for dashboard
const mockRecentTickets = [
  {
    id: "TICKET-043",
    title: "Implement user authentication",
    description: "Add login and registration functionality with JWT authentication",
    status: "In Progress",
    priority: "High",
    assignee: "John Doe",
    tags: ["Backend", "Security"],
    createdAt: "2023-08-15",
  },
  {
    id: "TICKET-044",
    title: "Design dashboard layout",
    description: "Create responsive dashboard layout with sidebar navigation",
    status: "Todo",
    priority: "Medium",
    assignee: "Jane Smith",
    tags: ["Frontend", "UI/UX"],
    createdAt: "2023-08-16",
  },
  {
    id: "TICKET-045",
    title: "Implement API endpoints for tickets",
    description: "Create RESTful API endpoints for ticket CRUD operations",
    status: "Blocked",
    priority: "High",
    assignee: "John Doe",
    tags: ["Backend", "API"],
    createdAt: "2023-08-17",
  },
  {
    id: "TICKET-046",
    title: "Add markdown support for wiki",
    description: "Implement markdown rendering for wiki pages",
    status: "Done",
    priority: "Medium",
    assignee: "Jane Smith",
    tags: ["Frontend", "Feature"],
    createdAt: "2023-08-18",
  },
  {
    id: "TICKET-047",
    title: "Implement drag and drop for sprint board",
    description: "Add drag and drop functionality for moving tickets between columns",
    status: "Todo",
    priority: "Low",
    assignee: "John Doe",
    tags: ["Frontend", "UX"],
    createdAt: "2023-08-19",
  },
]

// Mock wiki data for dashboard
const mockWikiPages = [
  {
    id: 1,
    title: "Getting Started",
    slug: "getting-started",
    excerpt: "Welcome to WorkForge! This guide will help you get started with our platform.",
  },
  {
    id: 2,
    title: "API Documentation",
    slug: "api-documentation",
    excerpt: "This document outlines the API endpoints available in WorkForge.",
  },
  {
    id: 3,
    title: "Best Practices",
    slug: "best-practices",
    excerpt: "Learn about the best practices for ticket management, sprint planning, and documentation.",
  },
]

// Sprint progress data
const sprintProgressData = [
  { day: "Day 1", completed: 2, remaining: 20, blocked: 0 },
  { day: "Day 2", completed: 5, remaining: 17, blocked: 0 },
  { day: "Day 3", completed: 8, remaining: 14, blocked: 0 },
  { day: "Day 4", completed: 10, remaining: 12, blocked: 2 },
  { day: "Day 5", completed: 12, remaining: 10, blocked: 2 },
  { day: "Day 6", completed: 15, remaining: 7, blocked: 1 },
  { day: "Day 7", completed: 18, remaining: 4, blocked: 0 },
  { day: "Day 8", completed: 20, remaining: 2, blocked: 0 },
  { day: "Day 9", completed: 21, remaining: 1, blocked: 0 },
  { day: "Day 10", completed: 22, remaining: 0, blocked: 0 },
]

// Ticket distribution data
const ticketDistributionData = [
  { name: "Todo", value: 8, color: "#94a3b8" },
  { name: "In Progress", value: 5, color: "#3b82f6" },
  { name: "Blocked", value: 2, color: "#ef4444" },
  { name: "Done", value: 10, color: "#22c55e" },
]

const ticketDistributionColors = {
  "OPEN": "#94a3b8",
  "IN PROGRESS": "#3b82f6",
  "BLOCKED": "#ef4444",
  "CLOSED": "#22c55e",
}

// Custom tooltip for Sprint Progress chart
const SprintProgressTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover border border-border p-2 rounded-md shadow-md text-sm">
        <p className="font-medium">{label}</p>
        <p className="text-emerald-500">Completed: {payload[0].value} tasks</p>
        <p className="text-blue-500">Remaining: {payload[1].value} tasks</p>
        <p className="text-red-500">Blocked: {payload[2].value} tasks</p>
      </div>
    )
  }
  return null
}

// Custom active shape for Pie Chart
const renderActiveShape = (props: any) => {
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props
  const sin = Math.sin((-midAngle * Math.PI) / 180)
  const cos = Math.cos((-midAngle * Math.PI) / 180)
  const sx = cx + (outerRadius + 10) * cos
  const sy = cy + (outerRadius + 10) * sin
  const mx = cx + (outerRadius + 30) * cos
  const my = cy + (outerRadius + 30) * sin
  const ex = mx + (cos >= 0 ? 1 : -1) * 22
  const ey = my
  const textAnchor = cos >= 0 ? "start" : "end"

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333" className="text-xs">
        {payload.name}
      </text>
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999" className="text-xs">
        {`${value} tickets (${(percent * 100).toFixed(0)}%)`}
      </text>
    </g>
  )
}

export default function Dashboard({ params }: { params: { teamId: string } }) {
  const router = useRouter()
  const { teamId } = params
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [ticketDistributionData, setTicketDistributionData] = useState(null)
  const [sprintProgressData, setSprintProgressData] = useState(null)
  const [teamInfo, setTeamInfo] = useState(null)
  const [wikiPages, setWikiPages] = useState<any[]>([])
  const [recentTickets, setRecentTickets] = useState<any[]>([])
  const [ticketTotals, setTicketTotals] = useState<any[]>([])

  const { user } = useUser()
  const teams = user?.TeamRoles.map((role) => role.Team) || []
  const selectedTeam = teams.find((team) => team.id === teamId)

  const { data, isLoading, error } = useSWR(`/api/dashboard/${teamId}`, fetcher, { revalidateOnFocus: false })

  // Redirect to team-specific dashboard
  useEffect(() => {
    if (teamId && window.location.pathname === "/dashboard") {
      router.push(`/dashboard/${teamId}`)
    }
  }, [teamId, router])

  useEffect(() => {
    if (data) {
      console.log(data)
      const { recentTicketEdits, recentWikiEdits, ticketDistribution, sprintDailyProgress, team, ticketTotals } = data
      //setSelectedTicket(recentTickets[0] || null)
      if (ticketDistribution) {
        const ticketStatusDistribution = ticketDistribution.map((item: any) => ({
          name: item.status,
          value: item._count.id,
          color: ticketDistributionColors[item.status] || "#000000",
        }))
        setTicketDistributionData(ticketStatusDistribution)
      }

      setTeamInfo(team)
      setWikiPages(recentWikiEdits)
      setRecentTickets(recentTicketEdits)

      if (ticketTotals) {
        // turn the ticket counts array into a map
        const ticketTotalsMap = ticketTotals.reduce((acc: any, item: any) => {
          acc[item.status] = item._count.id
          return acc
        }, {})
        // set the total number of tickets in the ticket counts map for any and all present values
        ticketTotalsMap["TOTAL"] = Object.values(ticketTotalsMap).reduce((acc: number, count: number) => acc + count, 0)
        setTicketTotals(ticketTotalsMap)
      }

      // Check if we have sprint daily progress data
      if (sprintDailyProgress) {
        const sprintProgress = [...sprintDailyProgress]
        const remainingTickets =
          (ticketDistribution.find((item: any) => item.status === "IN PROGRESS")?._count?.id || 0) +
          (ticketDistribution.find((item: any) => item.status === "OPEN")?._count?.id || 0)
        const todayProgress = {
          completed: ticketDistribution.find((item: any) => item.status === "CLOSED")?._count?.id || 0,
          remaining: remainingTickets,
          blocked: ticketDistribution.find((item: any) => item.status === "BLOCKED")?._count?.id || 0,
        }
        sprintProgress.push(todayProgress)

        // Add a day property to each object in the sprint progress data, day should just be the 'Day ' followed by index
        sprintProgress.forEach((item: any, index: number) => {
          item.day = `Day ${index + 1}`
        })

        console.log(sprintProgress)

        setSprintProgressData(sprintProgress)
      }
    }
  }, [data])

  const handleTicketClick = (ticket: any) => {
    if (teamId) {
      router.push(`/tickets/${teamId}/${ticket.id}`)
    }
  }

  const handleWikiClick = (wikiPage: any) => {
    if (teamId) {
      router.push(`/wiki/${teamId}/preview?page=${wikiPage.slug}`)
    }
  }

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index)
  }

  const completionPercentage = () => {
    if (!ticketTotals) return 0
    if (ticketTotals.CLOSED === undefined) return 0
    if (ticketTotals.TOTAL === undefined) return 0
    if (ticketTotals.TOTAL > 0) {
      return Math.round((ticketTotals.CLOSED / ticketTotals.TOTAL) * 100)
    }
    return 0
  }

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }
  if (error) {
    return <div className="flex items-center justify-center h-screen">Error loading data</div>
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          Dashboard -
          {selectedTeam && (
            <span className="ml-2 text-muted-foreground">
              {selectedTeam.icon} {selectedTeam.name}
            </span>
          )}
        </h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ticketTotals.TOTAL || 0}</div>
            <p className="text-xs text-muted-foreground">In current sprint</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ticketTotals.CLOSED || 0}</div>
            <p className="text-xs text-muted-foreground">{completionPercentage()}% completion rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Wiki Pages</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamInfo?._count.WikiPage}</div>
            <p className="text-xs text-muted-foreground">For current team</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamInfo?._count.TeamRoles}</div>
            <p className="text-xs text-muted-foreground">Active contributors</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Sprint Progress</CardTitle>
            <CardDescription>Current sprint completion status</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            {sprintProgressData ? (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sprintProgressData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="day" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip content={<SprintProgressTooltip />} />
                    <Legend />
                    <Bar dataKey="completed" name="Completed" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="remaining" name="Remaining" stackId="a" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="blocked" name="Blocked" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[300px]">
                <p className="text-muted-foreground mb-4">No sprint progress data available</p>
                <button
                  onClick={() => router.push(`/tickets/${teamId}`)}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                >
                  Go to Tickets
                </button>
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Ticket Distribution</CardTitle>
            <CardDescription>By status</CardDescription>
          </CardHeader>
          <CardContent>
            {ticketDistributionData ? (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      activeIndex={activeIndex}
                      activeShape={renderActiveShape}
                      data={ticketDistributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      dataKey="value"
                      onMouseEnter={onPieEnter}
                    >
                      {ticketDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[300px] text-center">
                <p className="text-muted-foreground mb-2">No active sprint found</p>
                <p className="text-sm text-muted-foreground">Start a sprint to see ticket distribution data</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates from the team</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="flex items-start gap-4 rounded-lg border p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleTicketClick(ticket)}
                >
                  <Clock className="mt-1 h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{ticket.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {ticket.assignee && `By ${ticket.assignee?.name} • `}Status: {ticket.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Wiki Pages</CardTitle>
            <CardDescription>Recent documentation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {wikiPages && wikiPages.map((wikiPage) => (
                <div
                  key={wikiPage.id}
                  className="flex items-start gap-4 rounded-lg border p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleWikiClick(wikiPage)}
                >
                  <FileText className="mt-1 h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{wikiPage.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">{wikiPage.summary}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <TicketPreviewDialog ticket={selectedTicket} open={isPreviewOpen} onOpenChange={setIsPreviewOpen} />
    </div>
  )
}

