"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { FileText, Plus, Search } from "lucide-react"
import ReactMarkdown from "react-markdown"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import useSWR from "swr"
import { fetcher } from "@/lib/db"

// Wiki page validation schema
const wikiPageSchema = z.object({
  title: z
    .string()
    .min(3, { message: "Title must be at least 3 characters" })
    .max(100, { message: "Title must be less than 100 characters" }),
  content: z.string().min(10, { message: "Content must be at least 10 characters" }),
})

type WikiPageFormValues = z.infer<typeof wikiPageSchema>

// Mock wiki data
const mockWikiPages = [
  {
    id: 1,
    slug: "getting-started",
    title: "Getting Started",
    content:
      "# Getting Started\n\nWelcome to WorkForge! This guide will help you get started with our platform.\n\n## First Steps\n\n1. Create your account\n2. Set up your profile\n3. Join a team\n\n## Key Features\n\n- **Ticketing System**: Track and manage tasks\n- **Wiki**: Document your processes\n- **Sprint Board**: Visualize your workflow\n\n```js\n// Example code\nconst greeting = 'Hello, WorkForge!';\nconsole.log(greeting);\n```",
    createdAt: "2023-05-15",
    updatedAt: "2023-06-20",
  },
  {
    id: 2,
    slug: "api-documentation",
    title: "API Documentation",
    content:
      '# API Documentation\n\nThis document outlines the API endpoints available in WorkForge.\n\n## Authentication\n\nAll API requests require authentication using a JWT token.\n\n```\nAuthorization: Bearer <your_token>\n```\n\n## Endpoints\n\n### GET /api/tickets\n\nReturns a list of all tickets.\n\n### POST /api/tickets\n\nCreates a new ticket.\n\n### GET /api/tickets/:id\n\nReturns details for a specific ticket.\n\n## Response Format\n\nAll responses are in JSON format with the following structure:\n\n```json\n{\n  "success": true,\n  "data": {},\n  "message": ""\n}\n```',
    createdAt: "2023-06-10",
    updatedAt: "2023-07-05",
  },
  {
    id: 3,
    slug: "best-practices",
    title: "Best Practices",
    content:
      "# Best Practices\n\n## Ticket Management\n\n- Use clear, descriptive titles\n- Add detailed descriptions\n- Link related tickets\n- Update status regularly\n\n## Sprint Planning\n\n1. Review backlog items\n2. Estimate effort\n3. Set realistic goals\n4. Assign responsibilities\n\n## Documentation\n\n- Keep the wiki up-to-date\n- Use markdown for formatting\n- Include examples\n- Link related documents\n\n> **Tip**: Regular updates to documentation save time in the long run.",
    createdAt: "2023-07-20",
    updatedAt: "2023-08-15",
  },
]

export default function WikiPage({ params }: { params: { teamId: string } }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { teamId } = params;
  const { selectedTeam } = { selectedTeam: { id: teamId } }//useTeam()
  const [wikiPages, setWikiPages] = useState(mockWikiPages)
  const [selectedPage, setSelectedPage] = useState(wikiPages[0])
  const [searchQuery, setSearchQuery] = useState("")
  const [isEditing, setIsEditing] = useState(false)

  const { data, error, isLoading } = useSWR(`/api/wiki/${teamId}`, fetcher, { revalidateOnFocus: false });



  // Form setup with Zod validation
  const form = useForm<WikiPageFormValues>({
    resolver: zodResolver(wikiPageSchema),
    defaultValues: {
      title: selectedPage.title,
      content: selectedPage.content,
    },
  })

  // Handle URL parameters for selecting specific wiki pages
  useEffect(() => {
    const pageId = searchParams.get("page")
    if (pageId) {
      const page = wikiPages.find((p) => p.slug === pageId)
      if (page) {
        setSelectedPage(page)
        setIsEditing(false)
        form.reset({
          title: page.title,
          content: page.content,
        })
      }
    }
  }, [searchParams, wikiPages, form])

  // Update form values when selected page changes
  useEffect(() => {
    form.reset({
      title: selectedPage.title,
      content: selectedPage.content,
    })
  }, [selectedPage, form])

  const filteredPages = wikiPages.filter((page) => page.title.toLowerCase().includes(searchQuery.toLowerCase()))

  const handlePageSelect = (page: (typeof wikiPages)[0]) => {
    setSelectedPage(page)
    setIsEditing(false)
    form.reset({
      title: page.title,
      content: page.content,
    })

    // Update URL with the selected page slug without full page reload
    if (selectedTeam) {
      const newUrl = `?page=${page.slug}`
      router.push(newUrl, { scroll: false })
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const onSubmit = (values: WikiPageFormValues) => {
    if (!selectedTeam) {
      return
    }
    fetch(`/api/wiki/${teamId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to create Wiki Page")
        }
        return response.json()
      }).then((data) => {
        const updatedPages = wikiPages.map((page) =>
          page.id === selectedPage.id
            ? {
              ...page,
              title: data.title,
              content: data.content,
              updatedAt: new Date().toISOString().split("T")[0],
            }
            : page,
        )
        setWikiPages(updatedPages)
        setSelectedPage({
          ...selectedPage,
          title: data.title,
          content: data.content,
          updatedAt: new Date().toISOString().split("T")[0],
        })
        setIsEditing(false)
        toast({
          title: "Wiki page updated",
          description: "Your changes have been saved successfully.",
        })
      }).catch((error) => {
        console.error(error)
        toast({
          title: "Error",
          description: "Failed to update wiki page. Please try again.",
        })
      });
  }
  const handleCreateNew = () => {
    const newPage = {
      id: wikiPages.length + 1,
      slug: "new-page",
      title: "New Page",
      content: "# New Page\n\nStart writing your content here...",
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
    }
    setWikiPages([...wikiPages, newPage])
    setSelectedPage(newPage)
    form.reset({
      title: newPage.title,
      content: newPage.content,
    })
    setIsEditing(true)
  }

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error loading wiki pages</div>
  if (data) {
    console.log(data)
  }

  return (
    <div className="flex h-full flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Wiki</h1>
        <Button onClick={handleCreateNew}>
          <Plus className="mr-2 h-4 w-4" /> New Page
        </Button>
      </div>

      <div className="grid flex-1 gap-6 md:grid-cols-[300px_1fr]">
        <div className="flex flex-col gap-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search wiki pages..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="rounded-lg border bg-card">
            <div className="p-2">
              <h2 className="px-2 py-1 text-lg font-semibold">Pages</h2>
              <div className="mt-2 space-y-1">
                {filteredPages.map((page) => (
                  <Button
                    key={page.id}
                    variant="ghost"
                    className={`w-full justify-start ${selectedPage.id === page.id ? "bg-muted" : ""}`}
                    onClick={() => handlePageSelect(page)}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    {page.title}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <Card className="flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between">
            {!isEditing && (
              <>
                <CardTitle>{selectedPage.title}</CardTitle>
                <CardDescription>Last updated: {selectedPage.updatedAt}</CardDescription>
                <Button onClick={handleEdit}>Edit</Button>
              </>
            )}
            {isEditing && (
              <div className="w-full flex justify-between items-center">
                <CardTitle>Editing Wiki Page</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                  <Button onClick={form.handleSubmit(onSubmit)}>Save</Button>
                </div>
              </div>
            )}
          </CardHeader>
          <CardContent className="flex-1">
            <Tabs defaultValue={isEditing ? "edit" : "preview"}>
              <TabsList className="mb-4">
                <TabsTrigger value="preview" disabled={isEditing}>
                  Preview
                </TabsTrigger>
                <TabsTrigger value="edit" disabled={!isEditing}>
                  Edit
                </TabsTrigger>
              </TabsList>
              <TabsContent value="preview" className="prose max-w-none dark:prose-invert">
                <ReactMarkdown>{selectedPage.content}</ReactMarkdown>
              </TabsContent>
              <TabsContent value="edit" className="h-full">
                {isEditing && (
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormDescription>The title of your wiki page.</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="content"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Content</FormLabel>
                            <FormControl>
                              <Textarea {...field} className="min-h-[500px] font-mono resize-none" />
                            </FormControl>
                            <FormDescription>
                              Write your content using Markdown. Headers, lists, code blocks, and other formatting are
                              supported.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </form>
                  </Form>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

