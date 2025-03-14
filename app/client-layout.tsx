"use client"

import type React from "react"
import { usePathname } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { Toaster } from "@/components/ui/toaster"
import { useRouter } from "next/router"

export default function ClientLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    const router = useRouter()
    const pathname = usePathname()
    const showSidebar = pathname !== "/"
        && pathname !== "/sign-in"
        && pathname !== "/create-organization"
        && pathname !== "/organizations"
        && !pathname.startsWith("/edit-organization");

    const setSelectedTeam = (id: string) => {
        const basePath = pathname.split("/")[1]
        router.push(`/${basePath}/${id}`)
    }

    return (
        <div>
            <div className="flex h-screen overflow-hidden">
                {showSidebar && <Sidebar setSelectedTeam={setSelectedTeam} />}
                <main className="flex-1 overflow-auto bg-background">{children}</main>
            </div>
            <Toaster />
        </div>
    )
}

