import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    if (!slug) {
        return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
    }

    try {
        const article = await prisma.wikiPage.findFirst({
            where: { slug: { equals: String(slug) } },
            select: {
                title: true,
                slug: true,
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

export async function POST() {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}