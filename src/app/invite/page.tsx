"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Separator } from "@/src/components/ui/separator"
import { Check, Copy, ArrowRight } from "lucide-react"
import { useToast } from "@/src/hooks/use-toast"
import { useSession } from "next-auth/react"

export default function InvitePage() {
    const { data: session } = useSession()
    const [email, setEmail] = useState<string>("")
    const [copied, setCopied] = useState(false)
    const router = useRouter()
    const { toast } = useToast()

    // In a real application, you would fetch the user's email from your auth provider
    useEffect(() => {
        // Simulating fetching user email
        // Replace this with actual auth integration
        const mockUserEmail = "user@example.com"
        setEmail(mockUserEmail)
    }, [])

    const copyToClipboard = async () => {
        try {
            if (session?.user?.email) {
                await navigator.clipboard.writeText(session?.user?.email)
                setCopied(true)
                toast({
                    title: "Email copied",
                    description: "Your email has been copied to clipboard",
                })

                // Reset the copied state after 2 seconds
                setTimeout(() => {
                    setCopied(false)
                }, 2000)
            }
        } catch (err) {
            toast({
                title: "Failed to copy",
                description: "Could not copy email to clipboard",
                variant: "destructive",
            })
        }
    }

    const redirectToCreateOrg = () => {
        router.push("/create-organization")
    }

    return (
        <div className="container flex items-center justify-center min-h-screen py-8">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl">Your Account</CardTitle>
                    <CardDescription>Share your email with a team owner or create your own organization</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Your email address</p>
                        <div className="flex items-center justify-between p-3 border rounded-md bg-muted/50">
                            <span className="font-medium">{session?.user?.email}</span>
                            <Button variant="ghost" size="icon" onClick={copyToClipboard} aria-label="Copy email to clipboard">
                                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <p className="text-sm">Send this email to a team owner to be invited to their organization.</p>
                    </div>
                </CardContent>

                <Separator />

                <CardFooter className="flex flex-col space-y-4 pt-6">
                    <p className="text-sm text-center w-full">Or create your own organization</p>
                    <Button className="w-full" onClick={redirectToCreateOrg}>
                        Create Organization
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}

