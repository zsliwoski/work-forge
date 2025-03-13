import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
export async function GET(request: Request, { params }: { params: Promise<{ teamId: string }> }) {
    const { teamId } = await params;

    if (!teamId) {
        return NextResponse.json({ error: 'Team ID is required' }, { status: 400 });
    }
    const pageSummary = prisma.wikiPage.findMany({
        where: { teamId },
        select: {
            id: true,
            title: true,
            updatedAt: true,
            category: true,
        }, orderBy: {
            updatedAt: 'desc'
        }
    });

    return NextResponse.json(pageSummary);
}