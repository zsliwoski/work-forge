import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
    const { slug } = await params;
    try {
        const teamId = slug[0];
        const sprintId = slug[1];

        if (!teamId) {
            return NextResponse.json({ message: 'Team ID is required' }, { status: 400 });
        }
        if (!sprintId) {
            const currentSprint = await prisma.team.findFirst({
                where: {
                    id: teamId,
                },
                select: {
                    sprints: true,
                }
            });

            if (!currentSprint) {
                return NextResponse.json({ message: 'No active sprint found for this team' }, { status: 404 });
            }
            return NextResponse.json(currentSprint, { status: 200 });
        } else {
            const sprint = await prisma.team.findFirst({
                where: {
                    id: teamId,
                },
                select: {
                    sprints: { where: { id: sprintId } },
                }
            });

            if (!sprint) {
                return NextResponse.json({ message: 'Sprint not found' }, { status: 404 });
            }

            return NextResponse.json(sprint, { status: 200 });
        }


    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

export async function POST() {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}