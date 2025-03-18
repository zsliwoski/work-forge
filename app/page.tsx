"use client"

import { useRouter } from "next/navigation"
import LandingPage from "./landing-page/landing-page"
import { useUser } from "@/contexts/user-provider"
import { useEffect } from "react"

export default function Home() {
  const { user } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      if (user.TeamRoles.length === 0) {
        router.push(`/invite`)
      } else {
        router.push(`/dashboard/${user.TeamRoles[0].Team.id}`)
      }
    }
  }, [user])

  if (!user) {
    return <LandingPage />
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      Redirecting to dashboard...
    </div>
  )
}

