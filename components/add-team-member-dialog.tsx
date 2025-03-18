"use client"

import { useState } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { UserPlus } from "lucide-react"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

type TeamRole = "admin" | "manager" | "developer" | "viewer"

// Define the validation schema with Zod
const formSchema = z.object({
    email: z.string().min(1, { message: "Email is required" }).email({ message: "Must be a valid email address" }),
    role: z.enum(["admin", "manager", "developer", "viewer"], {
        required_error: "Please select a role",
    }),
})

// Type for the form values based on the schema
type FormValues = z.infer<typeof formSchema>

interface AddTeamMemberDialogProps {
    onAddMember?: (email: string, role: TeamRole) => void
    inviterRole: number,
    teamId: string
}

export function AddTeamMemberDialog({ onAddMember, inviterRole, teamId }: AddTeamMemberDialogProps) {
    const [open, setOpen] = useState(false)
    const { toast } = useToast()

    // Initialize form with React Hook Form and Zod resolver
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            role: "viewer",
        },
    })

    const handleSubmit = (values: FormValues) => {
        // Call the onAddMember callback if provided

        const sendInvite = async () => {
            try {
                const data = { email: values.email, role: values.role }
                const response = await fetch(`/api/invite/send/${teamId}`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(values),
                })
                if (response.ok) {
                    if (onAddMember) {
                        onAddMember(values.email, values.role)
                    }
                } else {
                    const data = await response.json()
                    throw new Error(data.error)
                }
            } catch (error) {
                toast({
                    title: "Error sending invite",
                    description: "Team invite failed. Please try again.",
                })
            }
        }
        // Reset form and close dialog
        form.reset()
        setOpen(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add Team Member
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)}>
                        <DialogHeader>
                            <DialogTitle>Invite Team Member</DialogTitle>
                            <DialogDescription>
                                Send an invitation to a new team member. They'll receive an email with instructions to join.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem className="grid grid-cols-4 items-center gap-4">
                                        <FormLabel htmlFor="email" className="text-right">
                                            Email
                                        </FormLabel>
                                        <div className="col-span-3">
                                            <FormControl>
                                                <Input id="email" type="email" placeholder="colleague@example.com" {...field} />
                                            </FormControl>
                                            <FormMessage className="mt-1" />
                                        </div>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="role"
                                render={({ field }) => (
                                    <FormItem className="grid grid-cols-4 items-center gap-4">
                                        <FormLabel htmlFor="role" className="text-right">
                                            Role
                                        </FormLabel>
                                        <div className="col-span-3">
                                            <FormControl>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <SelectTrigger id="role">
                                                        <SelectValue placeholder="Select a role" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="admin">Admin</SelectItem>
                                                        <SelectItem value="manager">Manager</SelectItem>
                                                        <SelectItem value="developer">Developer</SelectItem>
                                                        <SelectItem value="viewer">Viewer</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </FormControl>
                                            <FormMessage className="mt-1" />
                                        </div>
                                    </FormItem>
                                )}
                            />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit">Send Invitation</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

