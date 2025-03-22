import { NextResponse } from 'next/server';
import { prisma } from '@/src/lib/db';
import { pageSchema } from '@/src/lib/schema';

// GET /api/wiki/:teamId
export async function GET(request: Request, { params }: { params: Promise<{ teamId: string }> }) {
    const { teamId } = await params;

    if (!teamId) {
        return NextResponse.json({ error: 'team ID is required' }, { status: 400 });
    }

    try {
        // Fetch all pages
        const pages = await prisma.wikiPage.findMany({
            where: { teamId },
            select: {
                id: true,
                title: true,
                updatedAt: true,
            }, orderBy: {
                updatedAt: 'desc',
            }
        });
        return NextResponse.json(pages);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to fetch pages' }, { status: 500 });
    }
}


// POST /api/wiki/:teamId
export async function POST(request: Request, { params }: { params: Promise<{ teamId: string }> }) {
    const { teamId } = await params;
    // Parse the request body and validate it against the page schema
    const body = await request.json();
    const validationResult = pageSchema.safeParse(body);

    if (!validationResult.success) {
        return NextResponse.json({ error: validationResult.error }, { status: 400 });
    }

    try {
        const row = {
            ...body,
            authorId: 'cm85696e60000vwbkm55ax25t',
            teamId,
        }
        // Create a new page
        const page = await prisma.wikiPage.create({
            data: row,
        });
        return NextResponse.json(page, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to create page' }, { status: 500 });
    }
}