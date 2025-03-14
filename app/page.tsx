"use client"

import { useRouter } from "next/navigation"
import LandingPage from "./landing-page/landing-page"
import { useUser } from "@/contexts/user-provider"

export default function Home() {
  const { user } = useUser()
  const router = useRouter()

  if (!user) {
    return <LandingPage />
  } else {
    router.push(`/dashboard/${user.TeamRoles[0].Team.id}`)
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      Redirecting to dashboard...
    </div>
  )
}

