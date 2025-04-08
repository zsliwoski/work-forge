import { getToken } from "next-auth/jwt";
import { prisma } from "@/src/lib/db";
import { NextRequest } from "next/server";

export const getUserRole = async (req: NextRequest, teamId: string) => {
    const token = await getToken({ req, raw: true });
    if (!token) {
        return null;
    }
    const userSession = await prisma.session.findFirst({ where: { sessionToken: token }, select: { userId: true } });
    if (!userSession) {
        return null;
    }
    const userRole = await prisma.userToTeam.findFirst({
        where: { userId: userSession.userId, teamId: teamId },
        select: { role: true },
    });
    if (!userRole) {
        return null;
    }
    return { role: userRole.role, userId: userSession.userId };
}
