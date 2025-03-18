"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, ArrowRight } from "lucide-react"
import { UserBadge } from "@/components/user-badge"
import confetti from "canvas-confetti"
import { set } from "date-fns"
import { useSession } from "next-auth/react"

export default function InviteAcceptedPage() {
    const { data: session } = useSession()
    const [roleData, setRoleData] = useState<any>(null)
    const router = useRouter()
    const searchParams = useSearchParams()
    const inviteId = searchParams.get("inviteId")

    useEffect(() => {
        if (!inviteId || !session) {
            // Redirect to the homepage if no invite ID or session is found
            router.push("/")
        } else {
            const deleteInvite = async () => {
                try {
                    const res = await fetch(`/api/invite/accept?inviteId=${inviteId}`, {
                        method: "DELETE",
                    })
                    if (!res.ok) {
                        throw new Error(res.statusText)
                    }
                    const role = await res.json()
                    if (!role) {
                        throw new Error("No role data found")
                    }

                    setRoleData(role)
                } catch (error) {
                    console.error("Failed to accept invite", error)
                    router.push("/")
                }
            }
            deleteInvite()
        }
    }, [session])

    useEffect(() => {
        if (roleData) {
            triggerConfetti()
        }
    }, [roleData])

    const triggerConfetti = () => {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
        })
    }

    const handleContinue = () => {
        // Redirect to the dashboard or workspace
        router.push(`/dashboard/${roleData.Team.id}`)
    }

    if (!roleData) {
        return (
            <div className="container flex items-center justify-center min-h-screen py-8 relative">
                <Card className="w-full max-w-md text-center">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-2xl">Accepting your invitation...</CardTitle>
                        <CardDescription>Just a moment</CardDescription>
                    </CardHeader>
                </Card>
            </div>)
    }

    return (
        <div className="container flex items-center justify-center min-h-screen py-8 relative">
            <Card className="w-full max-w-md text-center">
                <CardHeader className="pb-4">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                        <CheckCircle2 className="h-10 w-10 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">Welcome to {roleData.Team.name}!</CardTitle>
                    <CardDescription>Your invitation has been accepted successfully</CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                    <p>
                        You now have access to all the resources shared within this organization. Your account has been set up and
                        you're ready to collaborate with your team.
                    </p>

                    <div className="rounded-lg bg-muted p-4 mt-4">
                        <h3 className="font-medium mb-2">What's next?</h3>
                        <ul className="text-sm text-left space-y-2">
                            <li className="flex items-start">
                                <span className="mr-2">•</span>
                                <span>Explore the dashboard to see projects and resources</span>
                            </li>
                            <li className="flex items-start">
                                <span className="mr-2">•</span>
                                <span>Complete your profile with additional information</span>
                            </li>
                            <li className="flex items-start">
                                <span className="mr-2">•</span>
                                <span>Connect with team members and start collaborating</span>
                            </li>
                        </ul>
                    </div>
                </CardContent>

                <CardFooter className="flex justify-center pt-2">
                    <Button size="lg" onClick={handleContinue} className="w-full sm:w-auto">
                        Continue to Dashboard
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}

