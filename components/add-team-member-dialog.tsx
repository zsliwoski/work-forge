"use client"

import type React from "react"

import { useState } from "react"
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
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { UserPlus } from "lucide-react"

type TeamRole = "owner" | "editor" | "viewer"

interface AddTeamMemberDialogProps {
    onAddMember?: (email: string, role: TeamRole) => void
}

export function AddTeamMemberDialog({ onAddMember }: AddTeamMemberDialogProps) {
    const [email, setEmail] = useState("")
    const [role, setRole] = useState<TeamRole>("editor")
    const [open, setOpen] = useState(false)
    const { toast } = useToast()

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (!email) {
            toast({
                title: "Error",
                description: "Please enter an email address",
                variant: "destructive",
            })
            return
        }

        // Call the onAddMember callback if provided
        if (onAddMember) {
            onAddMember(email, role)
        } else {
            // Default implementation if no callback is provided
            toast({
                title: "Team member invited",
                description: `Invitation sent to ${email} with ${role} role`,
            })
        }

        // Reset form and close dialog
        setEmail("")
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
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Invite Team Member</DialogTitle>
                        <DialogDescription>
                            Send an invitation to a new team member. They'll receive an email with instructions to join.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="email" className="text-right">
                                Email
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="colleague@example.com"
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="role" className="text-right">
                                Role
                            </Label>
                            <Select value={role} onValueChange={(value) => setRole(value as TeamRole)}>
                                <SelectTrigger id="role" className="col-span-3">
                                    <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="owner">Owner</SelectItem>
                                    <SelectItem value="editor">Editor</SelectItem>
                                    <SelectItem value="viewer">Viewer</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit">Send Invitation</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

