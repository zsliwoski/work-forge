import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/dashboard/:teamId
/*export async function GET(request: Request, { params }: { params: Promise<{ teamId: string }> }) {
    const { teamId } = await params;

    if (!teamId) {
        return NextResponse.json({ error: 'Team ID is required' }, { status: 400 });
    }

    try {
        const tickets = [{title:"TestTitle", }]


        if (!tickets) {
            return NextResponse.json({ error: 'Team not found' }, { status: 404 });
        }

        return NextResponse.json(tickets);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to fetch team' }, { status: 500 });
    }
}*/