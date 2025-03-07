import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
    try {
        const articles = await prisma.wikiPage.findMany({
            select: {
                title: true,
                slug: true,
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

export async function POST() {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}