import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { articleSchema } from '@/lib/schema';

// GET /api/wiki
export async function GET() {
    try {
        // Fetch all articles
        const articles = await prisma.wikiPage.findMany({
            select: {
                id: true,
                title: true,
                author: {
                    select: {
                        image: true,
                        name: true,
                    },
                }
            },
        });
        return NextResponse.json(articles);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 });
    }
}

// POST /api/wiki
export async function POST(request: NextRequest) {

    // Parse the request body and validate it against the article schema
    const body = await request.json();
    const validationResult = articleSchema.safeParse(body);

    if (!validationResult.success) {
        return NextResponse.json({ error: validationResult.error }, { status: 400 });
    }

    try {
        // Create a new article
        const article = await prisma.wikiPage.create({
            data: body,
        });
        return NextResponse.json(article, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to create article' }, { status: 500 });
    }
}