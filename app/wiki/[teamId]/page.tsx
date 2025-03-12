"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { BookOpen, Clock, FileText, Plus, Search, Star, TrendingUp, Users } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Mock featured wiki pages
const featuredPages = [
  {
    id: 1,
    slug: "getting-started",
    title: "Getting Started",
    description: "Introduction to WorkForge and how to use the platform",
    category: "Onboarding",
    updatedAt: "2023-06-20",
    views: 1245,
  },
  {
    id: 2,
    slug: "api-documentation",
    title: "API Documentation",
    description: "Complete reference for the WorkForge API endpoints",
    category: "Development",
    updatedAt: "2023-07-05",
    views: 892,
  },
  {
    id: 3,
    slug: "best-practices",
    title: "Best Practices",
    description: "Guidelines for effective ticket and sprint management",
    category: "Process",
    updatedAt: "2023-08-15",
    views: 756,
  },
]

// Mock recent wiki pages
const recentPages = [
  {
    id: 4,
    slug: "sprint-planning",
    title: "Sprint Planning Guide",
    description: "How to plan and execute successful sprints",
    category: "Process",
    updatedAt: "2023-09-10",
    views: 324,
  },
  {
    id: 5,
    slug: "code-review",
    title: "Code Review Guidelines",
    description: "Standards and processes for effective code reviews",
    category: "Development",
    updatedAt: "2023-09-05",
    views: 412,
  },
  {
    id: 6,
    slug: "onboarding-checklist",
    title: "New Team Member Onboarding",
    description: "Step-by-step guide for onboarding new team members",
    category: "Onboarding",
    updatedAt: "2023-09-01",
    views: 287,
  },
]

// Mock categories
const categories = [
  { name: "Onboarding", count: 8, icon: Users },
  { name: "Development", count: 15, icon: FileText },
  { name: "Process", count: 12, icon: TrendingUp },
  { name: "Design", count: 7, icon: BookOpen },
]

export default function WikiHomePage({ params }: { params: { teamId: string } }) {
  const router = useRouter()
  const teamId = params.teamId
  const { selectedTeam } = { selectedTeam: { id: params.teamId } }//useTeam()  
  const [searchQuery, setSearchQuery] = useState("")

  const navigateToWiki = (slug: string) => {
    if (selectedTeam) {
      router.push(`/wiki/${selectedTeam.id}/preview?page=${slug}`)
    } else {
      router.push(`/wiki?page=${slug}`)
    }
  }

  const navigateToNewPage = () => {
    if (selectedTeam) {
      router.push(`/wiki/${selectedTeam.id}/new`)
    }
  }

  return (
    <div className="flex flex-col gap-8 p-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold">Wiki</h1>
          <Button onClick={navigateToNewPage}>
            <Plus className="mr-2 h-4 w-4" /> Create New Page
          </Button>
        </div>
        <p className="text-muted-foreground max-w-3xl">
          Welcome to the WorkForge Wiki. Here you'll find documentation, guides, and best practices for your team.
          Browse featured content, search for specific topics, or create your own wiki pages.
        </p>
      </div>

      <div className="relative max-w-xl">
        <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search the wiki..."
          className="pl-10 py-6 text-lg"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Tabs defaultValue="featured">
            <TabsList className="mb-4">
              <TabsTrigger value="featured">Featured</TabsTrigger>
              <TabsTrigger value="recent">Recently Updated</TabsTrigger>
              <TabsTrigger value="popular">Most Viewed</TabsTrigger>
            </TabsList>

            <TabsContent value="featured" className="space-y-4">
              {featuredPages.map((page) => (
                <Card key={page.id} className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => navigateToWiki(page.slug)}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center">
                          <FileText className="mr-2 h-5 w-5 text-primary" />
                          {page.title}
                        </CardTitle>
                        <CardDescription>{page.category}</CardDescription>
                      </div>
                      <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p>{page.description}</p>
                  </CardContent>
                  <CardFooter className="text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Clock className="mr-1 h-4 w-4" />
                      Updated {page.updatedAt}
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="recent" className="space-y-4">
              {recentPages.map((page) => (
                <Card key={page.id} className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => navigateToWiki(page.slug)}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center">
                          <FileText className="mr-2 h-5 w-5 text-primary" />
                          {page.title}
                        </CardTitle>
                        <CardDescription>{page.category}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p>{page.description}</p>
                  </CardContent>
                  <CardFooter className="text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Clock className="mr-1 h-4 w-4" />
                      Updated {page.updatedAt}
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="popular" className="space-y-4">
              {[...featuredPages, ...recentPages]
                .sort((a, b) => b.views - a.views)
                .slice(0, 3)
                .map((page) => (
                  <Card key={page.id} className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => navigateToWiki(page.slug)}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center">
                            <FileText className="mr-2 h-5 w-5 text-primary" />
                            {page.title}
                          </CardTitle>
                          <CardDescription>{page.category}</CardDescription>
                        </div>
                        <div className="flex items-center text-muted-foreground">
                          <TrendingUp className="mr-1 h-4 w-4" />
                          {page.views} views
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p>{page.description}</p>
                    </CardContent>
                    <CardFooter className="text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Clock className="mr-1 h-4 w-4" />
                        Updated {page.updatedAt}
                      </div>
                    </CardFooter>
                  </Card>
                ))}
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Categories</CardTitle>
              <CardDescription>Browse wiki pages by category</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {categories.map((category) => (
                <Button
                  key={category.name}
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => setSearchQuery(category.name)}
                >
                  <category.icon className="mr-2 h-5 w-5" />
                  {category.name}
                  <span className="ml-auto bg-muted rounded-full px-2 py-0.5 text-xs">
                    {category.count}
                  </span>
                </Button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={navigateToNewPage}
              >
                <Plus className="mr-2 h-5 w-5" />
                Create New Page
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigateToWiki("getting-started")}
              >
                <BookOpen className="mr-2 h-5 w-5" />
                Getting Started Guide
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
