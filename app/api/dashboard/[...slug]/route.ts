import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// OBJECTIVE:
// Get recent user activity for a team, this will be the 5 most recent ticket actions (create, update, delete)
// Get the 5 most recently edited wiki pages as well.
// Find some way to get the number of tickets in each status (open, in progress, resolved, closed) at the end of each weekday
// Get the number of tickets in this sprint compared to last sprint (maybe switch to points once thats implemented)

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