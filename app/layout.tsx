import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Sidebar } from "@/components/sidebar"
import { Toaster } from "@/components/ui/toaster"
import { TeamProvider } from "@/contexts/team-context"
import { TeamDebug } from "@/components/team-debug"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "WorkForge",
  description: "Ticketing system and Wiki Web app",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <TeamProvider>
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-auto bg-background">{children}</main>
          </div>
          <Toaster />
          <TeamDebug />
        </TeamProvider>
      </body>
    </html>
  )
}



import './globals.css'