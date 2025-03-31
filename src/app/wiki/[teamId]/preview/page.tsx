"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Input } from "@/src/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import { Textarea } from "@/src/components/ui/textarea"
import { useToast } from "@/src/components/ui/use-toast"
import { FileText, Plus, Search } from "lucide-react"
import ReactMarkdown from "react-markdown"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/components/ui/form"
import useSWR from "swr"
import { fetcher } from "@/src/lib/db"

// Wiki page validation schema
const wikiPageSchema = z.object({
  title: z
    .string()
    .min(3, { message: "Title must be at least 3 characters" })
    .max(100, { message: "Title must be less than 100 characters" }),
  content: z.string().min(10, { message: "Content must be at least 10 characters" }),
})

type WikiPageFormValues = z.infer<typeof wikiPageSchema>

export default function WikiPage({ params }: { params: { teamId: string } }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pageId = searchParams.get("page")
  const { toast } = useToast()
  const { teamId } = params
  const { selectedTeam } = { selectedTeam: { id: teamId } } //useTeam()
  //const [wikiPages, setWikiPages] = useState([])
  const [selectedPage, setSelectedPage] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [newPage, setNewPage] = useState(false)

  const {
    data: pageList,
    error: pageListError,
    isLoading: isPageListLoading,
  } = useSWR(`/api/wiki/${teamId}`, fetcher, { revalidateOnFocus: false })
  const {
    data: pageContent,
    error: pageError,
    isLoading: pageLoading,
    mutate
  } = useSWR(selectedPage ? `/api/wiki/${teamId}/${pageId}` : "", fetcher, { revalidateOnFocus: false })
  const wikiPages = pageList ? pageList : []

  if (pageId && wikiPages.length !== 0 && !selectedPage) {
    const page = wikiPages.find((p) => p.id === pageId)
    if (page) {
      setSelectedPage(page)
      setIsEditing(false)
    }
  }

  // Form setup with Zod validation
  const form = useForm<WikiPageFormValues>({
    resolver: zodResolver(wikiPageSchema),
    defaultValues: {
      title: selectedPage?.title ? selectedPage.title : "",
      content: pageContent ? pageContent : "",
    },
  })

  // Handle URL parameters for selecting specific wiki pages
  useEffect(() => {
    const pageId = searchParams.get("page")
    if (pageId) {
      const page = wikiPages.find((p) => p.id === pageId)
      if (page) {
        setSelectedPage(page)
        setIsEditing(false)
        form.reset({
          title: page.title,
          content: pageContent?.content,
        })
      }
    }
  }, [searchParams, wikiPages, form])

  // Update form values when selected page changes
  useEffect(() => {
    form.reset({
      title: selectedPage?.title ? selectedPage.title : "",
      content: pageContent?.content ? pageContent.content : "",
    })
  }, [selectedPage, form])

  const filteredPages = wikiPages.filter((page) => page.title.toLowerCase().includes(searchQuery.toLowerCase()))
  const navigateToNewPage = () => {
    if (selectedTeam) {
      router.push(`/wiki/${selectedTeam.id}/new`)
    }
  }
  const handlePageSelect = (page: (typeof wikiPages)[0]) => {
    setSelectedPage(page)
    form.reset({
      title: page.title,
      content: page.content,
    })
    setIsEditing(false)

    // Update URL with the selected page slug without full page reload
    if (selectedTeam) {
      const newUrl = `?page=${page.id}`
      router.push(newUrl, { scroll: false })
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const onSubmit = (values: WikiPageFormValues) => {
    if (!selectedTeam || !selectedPage) {
      return
    }

    const updateWikiPage = async () => {
      try {
        const response = await fetch(`/api/wiki/${teamId}/${pageId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        })

        if (!response.ok) {
          throw new Error("Failed to update Wiki Page")
        }

        const data = await response.json()

        const updatedPages = wikiPages.map((page) =>
          page.id === selectedPage.id
            ? {
              ...page,
              title: data.title,
              content: data.content,
              updatedAt: new Date().toISOString().split("T")[0],
            }
            : page
        )

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
        await mutate()
      } catch (error) {
        console.error(error)
        toast({
          title: "Error",
          description: "Failed to update wiki page. Please try again.",
        })
      }
    }

    updateWikiPage()
  }

  if (isPageListLoading) return <div>Loading...</div>
  if (pageListError) return <div>Error loading wiki pages</div>

  return (
    <div className="flex h-full flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Wiki</h1>
        <Button onClick={navigateToNewPage}>
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
                    className={`w-full justify-start ${selectedPage?.id === page.id ? "bg-muted" : ""}`}
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
                <CardTitle>{selectedPage?.title}</CardTitle>
                <CardDescription>Last updated: {selectedPage?.updatedAt}</CardDescription>
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
                <ReactMarkdown>{pageContent?.content}</ReactMarkdown>
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

