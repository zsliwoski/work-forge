"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Github, Ticket } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { signIn } from "next-auth/react"

export default function SignInPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleEmailSignIn = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate loading
    setTimeout(() => {
      setIsLoading(false)

      router.push("/dashboard")

      toast({
        title: "Signed in successfully",
        description: "Welcome back to WorkForge!",
      })
    }, 1000)

  }

  const handleSocialSignIn = (provider: string) => {
    setIsLoading(true)

    signIn(provider, { callbackUrl: "/" }).then((result) => {
      // For demo purposes, navigate to dashboard
      if (result?.error) {
        toast({
          title: "Error signing in",
          description: result.error,
          variant: "destructive",
        })
      } else {
        router.push("/")
        setIsLoading(false)
        toast({
          title: "Signed in successfully",
          description: `Welcome back to WorkForge! Signed in with ${provider}.`,
        })
      }
    }).catch((error) => {
      setIsLoading(false)

      toast({
        title: "Error signing in",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      })
    });
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Navigation */}
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <Ticket className="h-6 w-6" />
            <span className="text-xl font-bold cursor-pointer" onClick={() => router.push("/landing-page")}>
              WorkForge
            </span>
          </div>
        </div>
      </header>

      {/* Sign In Form */}
      <div className="container flex flex-1 items-center justify-center py-12">
        <Card className="mx-auto w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">Sign in to WorkForge</CardTitle>
            <CardDescription>Choose your preferred sign in method</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleSocialSignIn("github")}
                disabled={isLoading}
              >
                <Github className="mr-2 h-4 w-4" />
                GitHub
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleSocialSignIn("google")}
                disabled={isLoading}
              >
                <svg
                  className="mr-2 h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width="24"
                  height="24"
                >
                  <path
                    fill="currentColor"
                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5.36 14.8c-1.44 2.41-4.08 4-7.36 4-4.42 0-8-3.58-8-8 0-3.28 1.59-5.92 4-7.36v.02C7.2 3.86 9.48 3 12 3c2.52 0 4.8.86 6 2.46v-.02c2.41 1.44 4 4.08 4 7.36 0 2.52-.86 4.8-2.46 6l-.18-.2z"
                  />
                </svg>
                Google
              </Button>
            </div>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>
            <form onSubmit={handleEmailSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Button variant="link" className="h-auto p-0 text-xs">
                    Forgot password?
                  </Button>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In with Email"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col">
            <div className="text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Button variant="link" className="h-auto p-0">
                Sign up
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* Footer */}
      <footer className="border-t py-6">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} WorkForge. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}

