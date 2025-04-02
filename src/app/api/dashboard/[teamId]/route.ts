import { NextResponse } from 'next/server';
import { prisma } from '@/src/lib/db';

// OBJECTIVE:
// Get recent user activity for a team, this will be the 5 most recent ticket actions (create, update, delete)
// Get the 5 most recently edited wiki pages as well.
// Find some way to get the number of tickets in each status (open, in progress, resolved, closed) at the end of each weekday
// Get the number of tickets in this sprint compared to last sprint (maybe switch to points once thats implemented)

// GET /api/dashboard/:teamId
export async function GET(request: Request, { params }: { params: Promise<{ teamId: string }> }) {
    const { teamId } = await params;

    if (!teamId) {
        return NextResponse.json({ error: 'Team ID is required' }, { status: 400 });
    }

    try {
        // Get the 5 most recent ticket edits
        const recentTicketEdits = await prisma.ticket.findMany({
            where: { teamId },
            orderBy: { updatedAt: 'desc' },
            take: 5,
            select: {
                id: true,
                title: true,
                status: true,
                updatedAt: true,
                assignee: {
                    select: {
                        name: true,
                    },
                },
            }
        });

        // Get the 3 most recent wiki edits
        const recentWikiEdits = await prisma.wikiPage.findMany({
            where: { teamId },
            orderBy: { updatedAt: 'desc' },
            select: {
                id: true,
                title: true,
                summary: true,
                category: true,
            },
            take: 4,
        });

        const team = await prisma.team.findFirst({
            where: { id: teamId },
            select: {
                currentSprintId: true,
                // Get total number of tickets
                _count: {
                    select: {
                        WikiPage: true,
                        TeamRoles: true,
                    },
                },
            }
        })

        // Get the number of tickets in each status
        const ticketTotals = await prisma.ticket.groupBy({
            where: { teamId },
            by: ['status'],
            _count: {
                id: true,
            },
        });

        if (team?.currentSprintId) {
            // Get the distribution of tickets by status for the current sprint
            const ticketDistribution = await prisma.ticket.groupBy({
                where: {
                    teamId,
                    sprintId: team.currentSprintId,
                },
                by: ['status'],
                _count: {
                    id: true,
                },
            });

            const sprintDailyProgress = await prisma.sprintDailyProgress.findMany({
                where: { sprintId: team.currentSprintId },
                orderBy: { createdAt: 'asc' },
                take: 10,
                select: {
                    createdAt: true,
                    completed: true,
                    blocked: true,
                    remaining: true,
                },
            });

            return NextResponse.json({
                recentTicketEdits,
                recentWikiEdits,
                ticketTotals,
                team,
                ticketDistribution,
                sprintDailyProgress,
            });
        }
        return NextResponse.json({
            recentTicketEdits,
            recentWikiEdits,
            ticketTotals,
            team,
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}