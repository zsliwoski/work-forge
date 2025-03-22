"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Plus, Trash2, ArrowRight, ArrowLeft, Building, Users } from 'lucide-react'

import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Input } from "@/src/components/ui/input"
import { Textarea } from "@/src/components/ui/textarea"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/src/components/ui/form"
import { useToast } from "@/src/components/ui/use-toast"
import { Separator } from "@/src/components/ui/separator"
import { set } from "date-fns"
import { organizationSchema } from "@/src/lib/schema"


// Update the schemas with more detailed validation
// Organization schema
/*const organizationSchema = z.object({
    name: z.string()
        .min(2, { message: "Organization name must be at least 2 characters." })
        .max(50, { message: "Organization name must be less than 50 characters." }),
    description: z.string()
        .max(500, { message: "Description must be less than 500 characters." })
        .optional(),
})

// Team schema
const teamSchema = z.object({
    name: z.string()
        .min(2, { message: "Team name must be at least 2 characters." })
        .max(50, { message: "Team name must be less than 50 characters." }),
    members: z.array(
        z.object({
            email: z.string()
                .email({ message: "Please enter a valid email address." })
                .min(1, { message: "Email is required." }),
        }),
    ).min(1, { message: "At least one team member is required." }),
})

// Combined schema for the entire form
const formSchema = z.object({
    organization: organizationSchema,
    teams: z.array(teamSchema).min(1, { message: "Please create at least one team." }),
})
*/
type FormValues = z.infer<typeof organizationSchema>

export default function CreateOrganizationPage() {
    const [step, setStep] = useState(1)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [teams, setTeams] = useState({})
    const router = useRouter()
    const { toast } = useToast()

    // Initialize form with default values
    const form = useForm<FormValues>({
        resolver: zodResolver(organizationSchema),
        defaultValues: {
            name: "",
            icon: "",
            description: "",
            teams: [
                {
                    name: "",
                    icon: "",
                    description: "",
                    invitations: [{ email: "", role: "viewer" }],
                },
            ],
        },
    })

    // Add a new team
    const addTeam = () => {
        const currentTeams = form.getValues("teams")
        form.setValue("teams", [
            ...currentTeams,
            {
                name: "",
                icon: "",
                description: "",
                invitations: [{ email: "", role: "viewer" }],
            },
        ])
        setTeams(currentTeams)
    }

    // Remove a team
    const removeTeam = (index: number) => {
        const currentTeams = form.getValues("teams")
        if (currentTeams.length > 1) {
            form.setValue(
                "teams",
                currentTeams.filter((_, i) => i !== index),
            )
            setTeams(currentTeams)
        } else {
            toast({
                title: "Cannot remove team",
                description: "You need at least one team in your organization.",
                variant: "destructive",
            })
        }
    }

    // Add a new member to a team
    const addMember = (teamIndex: number) => {
        const currentTeams = form.getValues("teams")
        const updatedTeams = [...currentTeams]
        updatedTeams[teamIndex].invitations.push({ email: "", role: "viewer" })
        form.setValue("teams", updatedTeams)
        setTeams(updatedTeams)
    }

    // Remove a member from a team
    const removeMember = (teamIndex: number, memberIndex: number) => {
        const currentTeams = form.getValues("teams")
        const updatedTeams = [...currentTeams]
        if (updatedTeams[teamIndex].invitations.length > 1) {
            updatedTeams[teamIndex].invitations = updatedTeams[teamIndex].invitations.filter((_, i) => i !== memberIndex)
            form.setValue("teams", updatedTeams)
            setTeams(updatedTeams)
        } else {
            toast({
                title: "Cannot remove member",
                description: "Each team needs at least one member.",
                variant: "destructive",
            })
        }
    }

    // Handle form submission
    const onSubmit = async (data: FormValues) => {
        setIsSubmitting(true)
        try {
            console.log("Form submitted:", data)

            // Send the form data to the API
            const response = await fetch("/api/organization", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            })

            if (!response.ok) {
                throw new Error("Failed to create organization")
            }
            const json = await response.json()
            console.log(json)

            toast({
                title: "Organization created!",
                description: `${data.name} has been created with ${data.teams.length} teams.`,
            })

            // Redirect to the organization page
            router.push(`/`)
        } catch (error) {
            toast({
                title: "Error",
                description: "There was an error creating your organization.",
                variant: "destructive",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    // Navigate to the next step
    const goToNextStep = async () => {
        // Validate organization details before proceeding
        if (step === 1) {
            const orgResult = await form.trigger("name")
            if (orgResult) {
                setStep(2)
            }
        }
    }

    // Navigate to the previous step
    const goToPreviousStep = () => {
        if (step > 1) {
            setStep(step - 1)
        }
    }

    return (
        <div className="container max-w-3xl py-10">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Create a New Organization</CardTitle>
                    <CardDescription>
                        Set up your organization and teams to start collaborating with your team members.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            {step === 1 && (
                                <div className="space-y-6">
                                    <div className="flex items-center gap-2">
                                        <Building className="h-6 w-6 text-primary" />
                                        <h2 className="text-xl font-semibold">I. Organization Details</h2>
                                    </div>
                                    <Separator />
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Organization Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Acme Inc." {...field} />
                                                </FormControl>
                                                <FormDescription>
                                                    This is the name that will be displayed for your organization.
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="description"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Description (Optional)</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Brief description of your organization"
                                                        className="resize-none"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormDescription>Provide a short description of what your organization does.</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            )}

                            {step === 2 && (
                                <div className="space-y-6">
                                    <div className="flex items-center gap-2">
                                        <Users className="h-6 w-6 text-primary" />
                                        <h2 className="text-xl font-semibold">II. Team Creation</h2>
                                    </div>
                                    <Separator />
                                    <p className="text-sm text-muted-foreground">
                                        Create teams within your organization and invite members to join.
                                    </p>

                                    {form.getValues("teams").map((team, teamIndex) => (
                                        <div key={teamIndex} className="space-y-4 rounded-lg border p-4">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-lg font-medium">Team {teamIndex + 1}</h3>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => removeTeam(teamIndex)}
                                                    disabled={form.getValues("teams").length <= 1}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            <FormField
                                                control={form.control}
                                                name={`teams.${teamIndex}.name`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Team Name</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Engineering" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <div className="space-y-2">
                                                <FormLabel>Team Members</FormLabel>
                                                {team.invitations.map((invitation, memberIndex) => (
                                                    <div key={memberIndex} className="flex items-center gap-2">
                                                        <FormField
                                                            control={form.control}
                                                            name={`teams.${teamIndex}.invitations.${memberIndex}.email`}
                                                            render={({ field }) => (
                                                                <FormItem className="flex-1">
                                                                    <FormControl>
                                                                        <Input placeholder="member@example.com" {...field} />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="icon"
                                                            onClick={() => removeMember(teamIndex, memberIndex)}
                                                            disabled={team.invitations.length <= 1}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                ))}
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => addMember(teamIndex)}
                                                    className="mt-2"
                                                >
                                                    <Plus className="mr-2 h-4 w-4" />
                                                    Add Member
                                                </Button>
                                            </div>
                                        </div>
                                    ))}

                                    <Button type="button" variant="outline" onClick={addTeam} className="w-full">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Another Team
                                    </Button>
                                </div>
                            )}
                        </form>
                    </Form>
                </CardContent>
                <CardFooter className="flex justify-between">
                    {step > 1 ? (
                        <Button type="button" variant="outline" onClick={goToPreviousStep}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                        </Button>
                    ) : (
                        <div></div>
                    )}
                    {step < 2 ? (
                        <Button type="button" onClick={goToNextStep}>
                            Next
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    ) : (
                        <Button type="button" onClick={form.handleSubmit(onSubmit)} disabled={isSubmitting}>
                            {isSubmitting ? "Creating..." : "Create Organization"}
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </div>
    )
}
