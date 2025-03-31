"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Input } from "@/src/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import { Textarea } from "@/src/components/ui/textarea"
import { useToast } from "@/src/components/ui/use-toast"
import { ArrowLeft, Save } from "lucide-react"
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
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"

// Wiki page validation schema
const wikiPageSchema = z.object({
    title: z
        .string()
        .min(3, { message: "Title must be at least 3 characters" })
        .max(100, { message: "Title must be less than 100 characters" }),
    content: z.string().min(10, { message: "Content must be at least 10 characters" }),
    categoryId: z.string().transform((val) => Number.parseInt(val, 10)),
    summary: z.string().optional(),
})

type WikiPageFormValues = z.infer<typeof wikiPageSchema>

export default function NewWikiPage({ params }: { params: { teamId: string } }) {
    const router = useRouter()
    const { toast } = useToast()
    const { teamId } = params
    const [activeTab, setActiveTab] = useState<string>("edit")
    const [attachmentName, setAttachmentName] = useState<string>("")

    // Form setup with Zod validation
    const form = useForm<WikiPageFormValues>({
        resolver: zodResolver(wikiPageSchema),
        defaultValues: {
            title: "",
            content: "# New Page\n\nStart writing your content here...",
            categoryId: "1",
            summary: "",
        },
    })

    const onSubmit = (values: WikiPageFormValues) => {
        const formData = new FormData()
        formData.append("title", values.title)
        formData.append("content", values.content)
        formData.append("categoryId", values.categoryId.toString())

        if (values.summary) {
            formData.append("summary", values.summary)
        }

        const createWikiPage = async () => {
            try {
                const response = await fetch(`/api/wiki/${teamId}`, {
                    method: "POST",
                    body: formData,
                })

                if (!response.ok) {
                    throw new Error("Failed to create Wiki Page")
                }

                const data = await response.json()

                toast({
                    title: "Wiki page created",
                    description: "Your new page has been created successfully.",
                })

                // Redirect to the newly created page
                router.push(`/wiki/${teamId}/preview?page=${data.id}`)
            } catch (error) {
                console.error(error)
                toast({
                    title: "Error",
                    description: "Failed to create wiki page. Please try again.",
                    variant: "destructive",
                })
            }
        }

        createWikiPage()
    }

    const handlePreview = () => {
        setActiveTab("preview")
    }

    const handleEdit = () => {
        setActiveTab("edit")
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, onChange: (...event: any[]) => void) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            setAttachmentName(file.name)
            onChange(file)
        }
    }

    return (
        <div className="flex h-full flex-col gap-6 p-6">
            <div className="flex items-center gap-4">
                <Link href={`/wiki/${teamId}`}>
                    <Button variant="outline" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold">Create New Wiki Page</h1>
            </div>

            <Card className="flex flex-col">
                <CardHeader>
                    <CardTitle>New Wiki Page</CardTitle>
                    <CardDescription>Create a new wiki page for your team. Use Markdown to format your content.</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                    <Form {...form}>
                        <form id="wiki-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Title</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Enter page title" />
                                            </FormControl>
                                            <FormDescription>The title of your wiki page.</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="categoryId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Category</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value.toString()}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a category" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="1">Documentation (1)</SelectItem>
                                                    <SelectItem value="2">Tutorial (2)</SelectItem>
                                                    <SelectItem value="3">Reference (3)</SelectItem>
                                                    <SelectItem value="4">Guide (4)</SelectItem>
                                                    <SelectItem value="5">FAQ (5)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormDescription>Select the category for this page.</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="summary"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Summary</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="Brief summary of this page" />
                                        </FormControl>
                                        <FormDescription>A short description that summarizes this wiki page.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                <TabsList className="mb-4 grid w-full grid-cols-2">
                                    <TabsTrigger value="edit">Edit</TabsTrigger>
                                    <TabsTrigger value="preview">Preview</TabsTrigger>
                                </TabsList>
                                <TabsContent value="edit">
                                    <FormField
                                        control={form.control}
                                        name="content"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Content</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        {...field}
                                                        className="min-h-[500px] font-mono resize-none"
                                                        placeholder="Write your content using Markdown..."
                                                    />
                                                </FormControl>
                                                <FormDescription>
                                                    Write your content using Markdown. Headers, lists, code blocks, and other formatting are
                                                    supported.
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </TabsContent>
                                <TabsContent value="preview" className="min-h-[500px] border rounded-md p-4">
                                    <div className="prose max-w-none dark:prose-invert">
                                        <ReactMarkdown>{form.watch("content")}</ReactMarkdown>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </form>
                    </Form>
                </CardContent>
                <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={() => router.push(`/wiki/${teamId}`)}>
                        Cancel
                    </Button>
                    <div className="flex gap-2">
                        {activeTab === "edit" && (
                            <Button variant="outline" onClick={handlePreview}>
                                Preview
                            </Button>
                        )}
                        {activeTab === "preview" && (
                            <Button variant="outline" onClick={handleEdit}>
                                Back to Edit
                            </Button>
                        )}
                        <Button type="submit" form="wiki-form">
                            <Save className="mr-2 h-4 w-4" /> Create Page
                        </Button>
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}

