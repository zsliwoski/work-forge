"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { useSession } from "next-auth/react"
import LandingPage from "./landing-page/landing-page"

export default function Home() {
  const session = useSession()
  const router = useRouter()
  const selectedTeam = "cm856cns70001vwloi0zmt9yh" // Find the users last selected team, if null, grab the first in their list //useTeam()

  // Redirect to team-specific dashboard if we're at the root
  useEffect(() => {
    if (session?.status === "authenticated" && selectedTeam) {
      router.push(`/dashboard/${selectedTeam}`)
    }
  }, [selectedTeam, router])

  // TODO: styled redirect to signin
  if (!session || session.status === "unauthenticated") {
    return <LandingPage />
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      Redirecting to dashboard...
    </div>
  )
}

