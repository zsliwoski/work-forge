"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Textarea } from "@/src/components/ui/textarea"
import { useToast } from "@/src/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/src/components/ui/dialog"
import { Label } from "@/src/components/ui/label"
import { Separator } from "@/src/components/ui/separator"
import { Badge } from "@/src/components/ui/badge"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/src/components/ui/alert-dialog"
import { Building, Users, Plus, Trash2, Edit, Save, X, UserPlus, UserMinus, ArrowLeft } from "lucide-react"

// Mock team data with more details
const mockTeams = [
    {
        id: "engineering",
        name: "Engineering",
        description: "Software development team responsible for building and maintaining our products.",
        icon: "👨‍💻",
        members: [
            { id: "user1", name: "Jane Smith", email: "jane@example.com", role: "Owner" },
            { id: "user2", name: "John Doe", email: "john@example.com", role: "Editor" },
            { id: "user3", name: "Alice Johnson", email: "alice@example.com", role: "Viewer" },
        ],
    },
    {
        id: "design",
        name: "Design",
        description: "Creative team focused on user experience and interface design.",
        icon: "🎨",
        members: [
            { id: "user4", name: "Bob Wilson", email: "bob@example.com", role: "Owner" },
            { id: "user5", name: "Carol White", email: "carol@example.com", role: "Editor" },
        ],
    },
    {
        id: "marketing",
        name: "Marketing",
        description: "Team responsible for promoting our products and growing our user base.",
        icon: "📈",
        members: [
            { id: "user6", name: "Dave Brown", email: "dave@example.com", role: "Owner" },
            { id: "user7", name: "Eve Green", email: "eve@example.com", role: "Editor" },
        ],
    },
]

type TeamMember = {
    id: string
    name: string
    email: string
    role: "Owner" | "Editor" | "Viewer"
}

type Team = {
    id: string
    name: string
    description: string
    icon: string
    members: TeamMember[]
}

export default function EditOrganizationPage({ params }: { params: { organizationId: string } }) {
    const { organizationId } = params
    const router = useRouter()
    const { toast } = useToast()

    const [orgName, setOrgName] = useState("")
    const [orgIcon, setOrgIcon] = useState("")
    const [orgDescription, setOrgDescription] = useState("")
    const [teams, setTeams] = useState<Team[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [activeTab, setActiveTab] = useState("details")

    // Load organization data
    useEffect(() => {
        if (!organizationId) {
            toast({
                title: "Organization not found",
                description: "The requested organization could not be found.",
                variant: "destructive",
            })
            router.push("/")
            return
        }

        if (organizationId) {
            setOrgName("bing bong")
            setOrgIcon("i")
            setOrgDescription("") // In a real app, you would fetch this from the API

            // In a real app, you would fetch teams from an API
            setTeams(mockTeams)
        }
    }, [organizationId, router, toast])

    const handleSaveOrganization = () => {
        setIsLoading(true)

        // Validate inputs
        if (!orgName.trim()) {
            toast({
                title: "Error",
                description: "Organization name cannot be empty.",
                variant: "destructive",
            })
            setIsLoading(false)
            return
        }

        // Simulate API call
        setTimeout(() => {
            setIsLoading(false)
            toast({
                title: "Organization updated",
                description: "Your organization details have been saved successfully.",
            })
        }, 1000)
    }

    const handleDeleteOrganization = () => {
        // Simulate API call
        setTimeout(() => {
            toast({
                title: "Organization deleted",
                description: "Your organization has been deleted successfully.",
            })
            router.push("/")
        }, 1000)
    }

    const handleAddTeam = (newTeam: Omit<Team, "id" | "members">) => {
        const teamId = newTeam.name.toLowerCase().replace(/\s+/g, "-")
        const team: Team = {
            id: teamId,
            ...newTeam,
            members: [{ id: "current-user", name: "Current User", email: "user@example.com", role: "Owner" }],
        }

        setTeams([...teams, team])
        toast({
            title: "Team created",
            description: `${newTeam.name} has been created successfully.`,
        })
    }

    const handleUpdateTeam = (updatedTeam: Team) => {
        setTeams(teams.map((team) => (team.id === updatedTeam.id ? updatedTeam : team)))
        toast({
            title: "Team updated",
            description: `${updatedTeam.name} has been updated successfully.`,
        })
    }

    const handleDeleteTeam = (teamId: string) => {
        const teamToDelete = teams.find((team) => team.id === teamId)
        setTeams(teams.filter((team) => team.id !== teamId))
        toast({
            title: "Team deleted",
            description: `${teamToDelete?.name} has been deleted successfully.`,
        })
    }

    return (
        <div className="container mx-auto py-6 space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h1 className="text-3xl font-bold">Organization Settings</h1>
                </div>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive">Delete Organization</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete your organization and remove all associated
                                data including teams, projects, and settings.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                onClick={handleDeleteOrganization}
                            >
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-2 md:grid-cols-2">
                    <TabsTrigger value="details" className="flex items-center gap-2">
                        <Building className="h-4 w-4" />
                        <span>Organization Details</span>
                    </TabsTrigger>
                    <TabsTrigger value="teams" className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>Teams</span>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Organization Information</CardTitle>
                            <CardDescription>Update your organization's details and settings.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="orgName">Organization Name</Label>
                                    <Input
                                        id="orgName"
                                        value={orgName}
                                        onChange={(e) => setOrgName(e.target.value)}
                                        placeholder="Enter organization name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="orgIcon">Organization Icon</Label>
                                    <Input
                                        id="orgIcon"
                                        value={orgIcon}
                                        onChange={(e) => setOrgIcon(e.target.value)}
                                        placeholder="Enter an emoji or icon"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="orgDescription">Description</Label>
                                <Textarea
                                    id="orgDescription"
                                    value={orgDescription}
                                    onChange={(e) => setOrgDescription(e.target.value)}
                                    placeholder="Describe your organization"
                                    rows={4}
                                />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button onClick={handleSaveOrganization} disabled={isLoading}>
                                {isLoading ? "Saving..." : "Save Changes"}
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                <TabsContent value="teams" className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold">Teams</h2>
                        <AddTeamDialog onAddTeam={handleAddTeam} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {teams.map((team) => (
                            <TeamCard key={team.id} team={team} onUpdate={handleUpdateTeam} onDelete={handleDeleteTeam} />
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}

// Add Team Dialog Component
function AddTeamDialog({ onAddTeam }: { onAddTeam: (team: Omit<Team, "id" | "members">) => void }) {
    const [open, setOpen] = useState(false)
    const [name, setName] = useState("")
    const [icon, setIcon] = useState("👥")
    const [description, setDescription] = useState("")
    const { toast } = useToast()

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!name.trim()) {
            toast({
                title: "Error",
                description: "Team name cannot be empty.",
                variant: "destructive",
            })
            return
        }

        onAddTeam({
            name,
            icon,
            description,
        })

        // Reset form and close dialog
        setName("")
        setDescription("")
        setOpen(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    <span>Add Team</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Create New Team</DialogTitle>
                        <DialogDescription>
                            Add a new team to your organization. Teams help organize people and projects.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="teamName" className="text-right">
                                Team Name
                            </Label>
                            <Input
                                id="teamName"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Engineering, Marketing, etc."
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="teamIcon" className="text-right">
                                Icon
                            </Label>
                            <Input
                                id="teamIcon"
                                value={icon}
                                onChange={(e) => setIcon(e.target.value)}
                                placeholder="Use an emoji"
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="teamDescription" className="text-right">
                                Description
                            </Label>
                            <Textarea
                                id="teamDescription"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="What does this team do?"
                                className="col-span-3"
                                rows={3}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit">Create Team</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

// Team Card Component
function TeamCard({
    team,
    onUpdate,
    onDelete,
}: {
    team: Team
    onUpdate: (team: Team) => void
    onDelete: (teamId: string) => void
}) {
    const [isEditing, setIsEditing] = useState(false)
    const [name, setName] = useState(team.name)
    const [icon, setIcon] = useState(team.icon)
    const [description, setDescription] = useState(team.description)
    const { toast } = useToast()

    const handleSave = () => {
        if (!name.trim()) {
            toast({
                title: "Error",
                description: "Team name cannot be empty.",
                variant: "destructive",
            })
            return
        }

        onUpdate({
            ...team,
            name,
            icon,
            description,
        })

        setIsEditing(false)
    }

    const handleCancel = () => {
        setName(team.name)
        setIcon(team.icon)
        setDescription(team.description)
        setIsEditing(false)
    }

    return (
        <Card>
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    {isEditing ? (
                        <div className="space-y-2 w-full">
                            <div className="flex gap-2">
                                <Input value={icon} onChange={(e) => setIcon(e.target.value)} className="w-16" />
                                <Input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Team name"
                                    className="flex-1"
                                />
                            </div>
                        </div>
                    ) : (
                        <CardTitle className="flex items-center gap-2">
                            <span className="text-xl">{team.icon}</span>
                            <span>{team.name}</span>
                        </CardTitle>
                    )}

                    <div className="flex gap-1">
                        {isEditing ? (
                            <>
                                <Button variant="ghost" size="icon" onClick={handleCancel}>
                                    <X className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={handleSave}>
                                    <Save className="h-4 w-4" />
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)}>
                                    <Edit className="h-4 w-4" />
                                </Button>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="icon">
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Delete team?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This will permanently delete the {team.name} team and remove all associated data. Team members
                                                will lose access to this team's resources.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction
                                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                onClick={() => onDelete(team.id)}
                                            >
                                                Delete
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </>
                        )}
                    </div>
                </div>

                {isEditing ? (
                    <Textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Team description"
                        className="mt-2"
                        rows={2}
                    />
                ) : (
                    <CardDescription>{team.description}</CardDescription>
                )}
            </CardHeader>

            <CardContent>
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <h4 className="text-sm font-medium">Members ({team.members.length})</h4>
                        <TeamMemberDialog team={team} onUpdate={onUpdate} />
                    </div>

                    <div className="space-y-2">
                        {team.members.map((member) => (
                            <div key={member.id} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                                        {member.name.charAt(0)}
                                    </div>
                                    <span>{member.name}</span>
                                </div>
                                <Badge variant="outline">{member.role}</Badge>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

// Team Member Management Dialog
function TeamMemberDialog({ team, onUpdate }: { team: Team; onUpdate: (team: Team) => void }) {
    const [open, setOpen] = useState(false)
    const [email, setEmail] = useState("")
    const [role, setRole] = useState<"Owner" | "Editor" | "Viewer">("Editor")
    const { toast } = useToast()

    const handleAddMember = (e: React.FormEvent) => {
        e.preventDefault()

        if (!email.trim()) {
            toast({
                title: "Error",
                description: "Please enter an email address",
                variant: "destructive",
            })
            return
        }

        // Check if member already exists
        if (team.members.some((m) => m.email === email)) {
            toast({
                title: "Error",
                description: "This email is already a member of the team",
                variant: "destructive",
            })
            return
        }

        // Add new member
        const newMember: TeamMember = {
            id: `user-${Date.now()}`,
            name: email.split("@")[0], // Simple name from email
            email,
            role,
        }

        const updatedTeam = {
            ...team,
            members: [...team.members, newMember],
        }

        onUpdate(updatedTeam)
        setEmail("")
        toast({
            title: "Member added",
            description: `${email} has been added to the team as ${role}`,
        })
    }

    const handleRemoveMember = (memberId: string) => {
        const memberToRemove = team.members.find((m) => m.id === memberId)

        // Don't allow removing the last owner
        if (memberToRemove?.role === "Owner" && team.members.filter((m) => m.role === "Owner").length <= 1) {
            toast({
                title: "Error",
                description: "Cannot remove the last owner of the team",
                variant: "destructive",
            })
            return
        }

        const updatedTeam = {
            ...team,
            members: team.members.filter((m) => m.id !== memberId),
        }

        onUpdate(updatedTeam)
        toast({
            title: "Member removed",
            description: `${memberToRemove?.name} has been removed from the team`,
        })
    }

    const handleChangeRole = (memberId: string, newRole: "Owner" | "Editor" | "Viewer") => {
        // Don't allow changing role if it's the last owner
        if (
            newRole !== "Owner" &&
            team.members.find((m) => m.id === memberId)?.role === "Owner" &&
            team.members.filter((m) => m.role === "Owner").length <= 1
        ) {
            toast({
                title: "Error",
                description: "Cannot change the role of the last owner",
                variant: "destructive",
            })
            return
        }

        const updatedTeam = {
            ...team,
            members: team.members.map((m) => (m.id === memberId ? { ...m, role: newRole } : m)),
        }

        onUpdate(updatedTeam)
        toast({
            title: "Role updated",
            description: `Member role has been updated to ${newRole}`,
        })
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <UserPlus className="h-3 w-3" />
                    <span>Manage</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Manage Team Members</DialogTitle>
                    <DialogDescription>Add new members to the team or manage existing ones.</DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <form onSubmit={handleAddMember} className="flex items-end gap-2">
                        <div className="flex-1 space-y-1">
                            <Label htmlFor="memberEmail">Add Member</Label>
                            <Input
                                id="memberEmail"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="colleague@example.com"
                            />
                        </div>
                        <div className="w-24 space-y-1">
                            <Label htmlFor="memberRole">Role</Label>
                            <select
                                id="memberRole"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={role}
                                onChange={(e) => setRole(e.target.value as "Owner" | "Editor" | "Viewer")}
                            >
                                <option value="Owner">Owner</option>
                                <option value="Editor">Editor</option>
                                <option value="Viewer">Viewer</option>
                            </select>
                        </div>
                        <Button type="submit">Add</Button>
                    </form>

                    <Separator />

                    <div className="space-y-2">
                        <h3 className="text-sm font-medium">Current Members</h3>
                        <div className="rounded-md border">
                            {team.members.map((member) => (
                                <div key={member.id} className="flex items-center justify-between p-3 border-b last:border-0">
                                    <div>
                                        <div className="font-medium">{member.name}</div>
                                        <div className="text-sm text-muted-foreground">{member.email}</div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <select
                                            className="h-8 rounded-md border border-input bg-background px-2 py-1 text-xs"
                                            value={member.role}
                                            onChange={(e) => handleChangeRole(member.id, e.target.value as "Owner" | "Editor" | "Viewer")}
                                        >
                                            <option value="Owner">Owner</option>
                                            <option value="Editor">Editor</option>
                                            <option value="Viewer">Viewer</option>
                                        </select>
                                        <Button variant="ghost" size="icon" onClick={() => handleRemoveMember(member.id)}>
                                            <UserMinus className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

