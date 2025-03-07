"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Clock, FileText, Ticket, Users } from "lucide-react"
import { TicketPreviewDialog } from "@/components/ticket-preview-dialog"
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

export default function Dashboard() {
  const router = useRouter()
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)

  const handleTicketClick = (ticket: any) => {
    setSelectedTicket(ticket)
    setIsPreviewOpen(true)
  }

  const handleWikiClick = (wikiPage: any) => {
    router.push(`/wiki?page=${wikiPage.slug}`)
  }

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index)
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45</div>
            <p className="text-xs text-muted-foreground">+2 from last sprint</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">32</div>
            <p className="text-xs text-muted-foreground">71% completion rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Wiki Pages</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">+3 this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
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
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Ticket Distribution</CardTitle>
            <CardDescription>By status</CardDescription>
          </CardHeader>
          <CardContent>
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
              {mockRecentTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="flex items-start gap-4 rounded-lg border p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleTicketClick(ticket)}
                >
                  <Clock className="mt-1 h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{ticket.title}</p>
                    <p className="text-xs text-muted-foreground">
                      By {ticket.assignee} • Status: {ticket.status}
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
              {mockWikiPages.map((wikiPage) => (
                <div
                  key={wikiPage.id}
                  className="flex items-start gap-4 rounded-lg border p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleWikiClick(wikiPage)}
                >
                  <FileText className="mt-1 h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{wikiPage.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">{wikiPage.excerpt}</p>
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

