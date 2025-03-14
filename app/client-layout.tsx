"use client"

import type React from "react"
import { usePathname } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { Toaster } from "@/components/ui/toaster"

export default function ClientLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    const pathname = usePathname()
    const showSidebar = pathname !== "/"
        && pathname !== "/sign-in"
        && pathname !== "/create-organization"
        && pathname !== "/organizations"
        && !pathname.startsWith("/edit-organization");

    return (
        <div>
            <div className="flex h-screen overflow-hidden">
                {showSidebar && <Sidebar />}
                <main className="flex-1 overflow-auto bg-background">{children}</main>
            </div>
            <Toaster />
        </div>
    )
}

