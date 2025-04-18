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
} from "@/src/components/ui/dialog"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import { useToast } from "@/src/components/ui/use-toast"
import { UserPlus } from "lucide-react"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/src/components/ui/form"
import { inviteFormSchema } from "@/src/lib/schema"

type TeamRole = "admin" | "manager" | "developer" | "viewer"

// Type for the form values based on the schema
type FormValues = z.infer<typeof inviteFormSchema>

interface AddTeamMemberDialogProps {
    onAddMember?: (email: string, role: TeamRole) => void
    inviterRole: number,
}

export function AddTeamMemberDialog({ onAddMember, inviterRole }: AddTeamMemberDialogProps) {
    const [open, setOpen] = useState(false)
    const { toast } = useToast()

    // Initialize form with React Hook Form and Zod resolver
    const form = useForm<FormValues>({
        resolver: zodResolver(inviteFormSchema),
        defaultValues: {
            email: "",
            role: "viewer",
        },
    })

    const handleSubmit = (values: FormValues) => {
        // Call the onAddMember callback if provided
        if (onAddMember) {
            onAddMember(values.email, values.role)
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

