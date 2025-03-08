import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sprintSchema } from '@/lib/schema';

// GET /api/sprint/:teamId
// GET /api/sprint/:teamId/:sprintId
export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
    const { slug } = await params;
    try {
        const teamId = slug[0];
        const sprintId = slug[1];

        if (!teamId) {
            return NextResponse.json({ message: 'Team ID is required' }, { status: 400 });
        }

        // If sprintId is not provided, return the active sprint for the team
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
            // If sprintId is provided, return the specific sprint
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

// POST /api/sprint/:teamId
export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
    const { slug } = await params;
    const teamId = slug[0];

    if (!teamId) {
        return NextResponse.json({ error: 'Invalid team ID' }, { status: 400 });
    }

    // Parse the request body and validate it against the sprint schema
    const body = await req.json();
    const validationResult = sprintSchema.safeParse({ ...body, teamId });

    if (!validationResult.success) {
        return NextResponse.json({ error: validationResult.error.errors }, { status: 400 });
    }

    try {
        // Create a new sprint
        const sprint = await prisma.sprint.create({
            data: body,
        });
        return NextResponse.json(sprint, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to create sprint' }, { status: 500 });
    }
}

// PUT /api/sprint/:teamId/:sprintId
export async function PUT(req: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
    const { slug } = await params;
    const teamId = slug[0];
    const sprintId = slug[1];

    if (!teamId) {
        return NextResponse.json({ error: 'Invalid team ID' }, { status: 400 });
    }
    if (!sprintId) {
        return NextResponse.json({ error: 'Invalid sprint ID' }, { status: 400 });
    }

    // Parse the request body and validate it against the sprint schema
    const body = await req.json();
    const validationResult = sprintSchema.safeParse({ ...body, teamId });

    if (!validationResult.success) {
        return NextResponse.json({ error: validationResult.error.errors }, { status: 400 });
    }

    try {
        // Update the sprint
        const sprint = await prisma.sprint.update({
            where: { id: sprintId },
            data: body,
        });
        return NextResponse.json(sprint, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to update sprint' }, { status: 500 });
    }
}

// DELETE /api/sprint/:teamId/:sprintId
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
    const { slug } = await params;
    const teamId = slug[0];
    const sprintId = slug[1];

    if (!teamId) {
        return NextResponse.json({ error: 'Invalid team ID' }, { status: 400 });
    }
    if (!sprintId) {
        return NextResponse.json({ error: 'Invalid sprint ID' }, { status: 400 });
    }

    try {
        // Delete the sprint
        const sprint = await prisma.sprint.delete({
            where: { id: sprintId },
        });
        return NextResponse.json(sprint, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to delete sprint' }, { status: 500 });
    }
}
