"use client"

import type React from "react"
import { usePathname } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { Toaster } from "@/components/ui/toaster"
import { useRouter } from "next/router"
import { TeamProvider } from "@/contexts/team-provider"

export default function ClientLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    const pathname = usePathname()
    const showSidebar = pathname.startsWith("/dashboard") ||
        pathname.startsWith("/sprint-board") ||
        pathname.startsWith("/tickets") ||
        pathname.startsWith("/settings") ||
        pathname.startsWith("/wiki")

    return (
        <div>
            <div className="flex h-screen overflow-hidden">
                <TeamProvider>
                    {showSidebar && <Sidebar />}
                    <main className="flex-1 overflow-auto bg-background">{children}</main>
                </TeamProvider>
            </div>
            <Toaster />
        </div>
    )
}

