"use client"
import { useRouter } from "next/navigation"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent } from "@/src/components/ui/card"
import { CheckCircle, ArrowRight, Calendar, FileText, Ticket } from "lucide-react"

export default function LandingPage() {
  const router = useRouter()

  const handleGetStarted = () => {
    router.push("/sign-in")
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Navigation */}
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <Ticket className="h-6 w-6" />
            <span className="text-xl font-bold">WorkForge</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push("/sign-in")}>
              Sign In
            </Button>
            <Button onClick={handleGetStarted}>Get Started</Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container flex flex-1 flex-col items-center justify-center gap-6 py-12 text-center md:py-20">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
            Streamline Your Team&apos;s Workflow
          </h1>
          <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
            WorkForge helps teams track tasks, manage sprints, and document knowledge in one unified platform.
          </p>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row">
          <Button size="lg" onClick={handleGetStarted}>
            Get Started <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button size="lg" variant="outline" onClick={() => router.push("/sign-in")}>
            Sign In
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="container py-12 md:py-20">
        <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
          <Card>
            <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
              <div className="rounded-full bg-primary/10 p-3">
                <Ticket className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Ticket Management</h3>
              <p className="text-muted-foreground">
                Create, assign, and track tickets with customizable workflows and priorities.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
              <div className="rounded-full bg-primary/10 p-3">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Sprint Planning</h3>
              <p className="text-muted-foreground">
                Plan and visualize sprints with interactive boards and progress tracking.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
              <div className="rounded-full bg-primary/10 p-3">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Knowledge Base</h3>
              <p className="text-muted-foreground">
                Document and share knowledge with a powerful wiki system and markdown support.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-muted py-12 md:py-20">
        <div className="container">
          <div className="mx-auto max-w-5xl space-y-12">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Why Teams Choose WorkForge
              </h2>
              <p className="mx-auto mt-4 max-w-[700px] text-muted-foreground">
                Trusted by teams of all sizes to improve productivity and collaboration.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2">
              <div className="flex gap-4">
                <CheckCircle className="h-6 w-6 flex-shrink-0 text-primary" />
                <div>
                  <h3 className="text-xl font-bold">Increased Productivity</h3>
                  <p className="text-muted-foreground">
                    Teams report up to 30% increase in productivity after adopting WorkForge.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <CheckCircle className="h-6 w-6 flex-shrink-0 text-primary" />
                <div>
                  <h3 className="text-xl font-bold">Better Collaboration</h3>
                  <p className="text-muted-foreground">
                    Centralized information and real-time updates improve team collaboration.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <CheckCircle className="h-6 w-6 flex-shrink-0 text-primary" />
                <div>
                  <h3 className="text-xl font-bold">Transparent Workflows</h3>
                  <p className="text-muted-foreground">
                    Visualize work progress and identify bottlenecks with intuitive dashboards.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <CheckCircle className="h-6 w-6 flex-shrink-0 text-primary" />
                <div>
                  <h3 className="text-xl font-bold">Knowledge Retention</h3>
                  <p className="text-muted-foreground">
                    Preserve institutional knowledge with an integrated wiki system.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-12 md:py-20">
        <div className="mx-auto max-w-5xl rounded-lg border bg-card p-8 text-center shadow-sm">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Ready to Transform Your Workflow?</h2>
          <p className="mx-auto mt-4 max-w-[700px] text-muted-foreground">
            Join thousands of teams already using WorkForge to streamline their work.
          </p>
          <Button size="lg" className="mt-6" onClick={handleGetStarted}>
            Get Started Today
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-6 md:py-8">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <Ticket className="h-5 w-5" />
            <span className="text-lg font-semibold">WorkForge</span>
          </div>
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} WorkForge. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Button variant="ghost" size="sm">
              Terms
            </Button>
            <Button variant="ghost" size="sm">
              Privacy
            </Button>
          </div>
        </div>
      </footer>
    </div>
  )
}

