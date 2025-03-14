import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { group } from "console";
export async function GET(request: Request, { params }: { params: Promise<{ teamId: string }> }) {
    const { teamId } = await params;

    if (!teamId) {
        return NextResponse.json({ error: 'Team ID is required' }, { status: 400 });
    }
    const recentPages = await prisma.wikiPage.findMany({
        where: { teamId },
        select: {
            id: true,
            title: true,
            updatedAt: true,
            category: true,
            summary: true
        }, orderBy: {
            updatedAt: 'desc'
        }, take: 5
    });
    const categoryCount = await prisma.wikiPage.groupBy({ by: 'category', where: { teamId }, _count: { id: true } });
    return NextResponse.json({ recentPages, categoryCount });
}