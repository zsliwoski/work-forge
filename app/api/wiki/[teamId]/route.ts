import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { articleSchema } from '@/lib/schema';

// GET /api/wiki/:teamId
// GET /api/wiki/:teamId/:articleId
export async function GET(request: Request, { params }: { params: Promise<{ teamId: string, articleId: string }> }) {
    const { teamId, articleId } = await params;

    if (!teamId) {
        return NextResponse.json({ error: 'team ID is required' }, { status: 400 });
    }
    if (!articleId) {
        try {
            // Fetch all articles
            const articles = await prisma.wikiPage.findMany({
                where: { teamId },
                select: {
                    id: true,
                    title: true,
                }
            });
            return NextResponse.json(articles);
        } catch (error) {
            console.error(error);
            return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 });
        }
    } else {
        try {
            const article = await prisma.wikiPage.findFirst({
                where: { id: articleId },
                select: {
                    title: true,
                    content: true,
                    author: {
                        select: {
                            image: true,
                            name: true,
                        },
                    }
                },
            });

            if (!article) {
                return NextResponse.json({ error: 'Article not found' }, { status: 404 });
            }

            return NextResponse.json(article);
        } catch (error) {
            console.error(error);
            return NextResponse.json({ error: 'Failed to fetch article' }, { status: 500 });
        }
    }
}

// PUT /api/wiki/:articleId
export async function PUT(request: Request, { params }: { params: Promise<{ articleId: string }> }) {
    const { articleId } = await params;

    if (!articleId) {
        return NextResponse.json({ error: 'Article ID is required' }, { status: 400 });
    }

    // Parse the request body and validate it against the article schema
    const body = await request.json();
    const validationResult = articleSchema.safeParse(body);

    if (!validationResult.success) {
        return NextResponse.json({ error: validationResult.error }, { status: 400 });
    }

    try {
        const article = await prisma.wikiPage.update({
            where: { id: articleId },
            data: body,
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to update article' }, { status: 500 });
    }
}

// DELETE /api/wiki/:articleId
export async function DELETE(request: Request, { params }: { params: Promise<{ articleId: string }> }) {
    const { articleId } = await params;

    if (!articleId) {
        return NextResponse.json({ error: 'Article ID is required' }, { status: 400 });
    }

    try {
        // Delete the article
        const article = await prisma.wikiPage.delete({
            where: { id: articleId },
        });
        return NextResponse.json(article);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to delete article' }, { status: 500 });
    }
}

// POST /api/wiki/:teamId
export async function POST(request: Request, { params }: { params: Promise<{ teamId: string }> }) {
    const { teamId } = await params;
    // Parse the request body and validate it against the article schema
    const body = await request.json();
    const validationResult = articleSchema.safeParse(body);

    if (!validationResult.success) {
        return NextResponse.json({ error: validationResult.error }, { status: 400 });
    }

    try {
        const row = {
            ...body,
            authorId: 'cm85696e60000vwbkm55ax25t',
            teamId,
        }
        // Create a new article
        const article = await prisma.wikiPage.create({
            data: row,
        });
        return NextResponse.json(article, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to create article' }, { status: 500 });
    }
}