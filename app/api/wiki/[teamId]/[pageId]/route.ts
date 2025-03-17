import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { pageSchema } from '@/lib/schema';

// GET /api/wiki/:teamId
// GET /api/wiki/:teamId/:pageId
export async function GET(request: Request, { params }: { params: Promise<{ teamId: string, pageId: string }> }) {
    const { teamId, pageId } = await params;

    if (!teamId) {
        return NextResponse.json({ error: 'team ID is required' }, { status: 400 });
    }
    if (!pageId) {
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
    } else {
        try {
            console.log(pageId);
            const page = await prisma.wikiPage.findFirst({
                where: { id: pageId },
                select: {
                    id: true,
                    title: true,
                    content: true,
                    updatedAt: true,
                    author: {
                        select: {
                            image: true,
                            name: true,
                        },
                    }
                },
            });

            if (!page) {
                return NextResponse.json({ error: 'page not found' }, { status: 404 });
            }

            return NextResponse.json(page);
        } catch (error) {
            console.error(error);
            return NextResponse.json({ error: 'Failed to fetch page' }, { status: 500 });
        }
    }
}

// PUT /api/wiki/:pageId
export async function PUT(request: Request, { params }: { params: Promise<{ pageId: string }> }) {
    const { pageId } = await params;

    if (!pageId) {
        return NextResponse.json({ error: 'page ID is required' }, { status: 400 });
    }

    // Parse the request body and validate it against the page schema
    const body = await request.json();
    const validationResult = pageSchema.safeParse(body);

    if (!validationResult.success) {
        return NextResponse.json({ error: validationResult.error }, { status: 400 });
    }

    try {
        const page = await prisma.wikiPage.update({
            where: { id: pageId },
            data: body,
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to update page' }, { status: 500 });
    }
}

// DELETE /api/wiki/:pageId
export async function DELETE(request: Request, { params }: { params: Promise<{ pageId: string }> }) {
    const { pageId } = await params;

    if (!pageId) {
        return NextResponse.json({ error: 'page ID is required' }, { status: 400 });
    }

    try {
        // Delete the page
        const page = await prisma.wikiPage.delete({
            where: { id: pageId },
        });
        return NextResponse.json(page);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to delete page' }, { status: 500 });
    }
}