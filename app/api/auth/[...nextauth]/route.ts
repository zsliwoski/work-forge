import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"

import { prisma } from '@/lib/db';
import { PrismaAdapter } from '@auth/prisma-adapter';

export const authOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_ID!,
            clientSecret: process.env.GOOGLE_SECRET!,
        }),
        GitHubProvider({
            clientId: process.env.GITHUB_ID!,
            clientSecret: process.env.GITHUB_SECRET!,
        }),
    ],
    adapter: PrismaAdapter(prisma),
    pages: {
        signIn: "/sign-in",
    },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }

