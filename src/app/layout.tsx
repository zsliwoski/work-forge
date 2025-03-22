import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import ClientLayout from "./client-layout"
import SessionProvider from "@/src/contexts/session-provider"
import { authOptions } from "./api/auth/[...nextauth]/route"
import { getServerSession } from "next-auth"
import { UserProvider } from "@/src/contexts/user-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "WorkForge",
  description: "Ticketing system and Wiki Web app",
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await getServerSession(authOptions);
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider session={session}>
          <UserProvider>
            <ClientLayout>{children}</ClientLayout>
          </UserProvider>
        </SessionProvider>
      </body>
    </html>
  )
}

