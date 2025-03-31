import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/db';
import { sprintSchema } from '@/src/lib/schema';

// GET /api/sprint/:teamId
// GET /api/sprint/:teamId/:sprintId
export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
    const { slug } = await params;

    if (!slug) {
        return NextResponse.json({ message: 'Invalid route' }, { status: 400 });
    }

    const teamId = slug[0];
    const sprintId = slug[1];

    try {

        if (!teamId) {
            return NextResponse.json({ message: 'Team ID is required' }, { status: 400 });
        }

        // If sprintId is not provided, return the active sprint for the team
        if (!sprintId) {
            const team = await prisma.team.findFirst({
                where: {
                    id: teamId,
                },
                select: {
                    currentSprintId: true,
                    nextSprintId: true,
                }
            });

            if (!team) {
                return NextResponse.json({ message: 'Team not found' }, { status: 404 });
            }
            if (team.currentSprintId) {
                const sprint = await prisma.sprint.findFirst({
                    where: {
                        teamId: teamId,
                        id: team.currentSprintId,
                    }, select: {
                        id: true,
                        description: true,
                        title: true,
                        tickets: {
                            select: {
                                id: true,
                                title: true,
                                description: true,
                                status: true,
                                assignee: true,
                                priority: true,
                            },
                        },
                    }
                });
                return NextResponse.json({ isCurrent: true, sprint }, { status: 200 });
            }
            return NextResponse.json({ message: 'No current sprint found' }, { status: 200 });
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

    const { searchParams } = new URL(req.url);
    // if start is present, it means the next sprint is being started
    const next = searchParams.has('next');

    console.log(next)

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
        // If next param is present, set the next sprint for the team
        if (next) {
            const team = await prisma.team.findFirst({
                where: {
                    id: teamId,
                },
                select: {
                    nextSprintId: true,
                }
            });

            // If the team already has a next sprint, return an error
            if (team?.nextSprintId) {
                return NextResponse.json({ error: 'Next sprint already exists' }, { status: 400 });
            }

            // Create a new sprint
            const sprint = await prisma.sprint.create({
                data: { ...body, Team: { connect: { id: teamId } } },
            });

            // Set the next sprint for the team
            await prisma.team.update({
                where: { id: teamId },
                data: {
                    nextSprintId: sprint.id,
                },
            });
            return NextResponse.json(sprint, { status: 200 });

        } else {
            // Create a new sprint
            const sprint = await prisma.sprint.create({
                data: { ...body, Team: { connect: { id: teamId } } },
            });
            return NextResponse.json(sprint, { status: 200 });
        }
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

    const { searchParams } = new URL(req.url);
    // if start is present, it means the next sprint is being started
    const startParam = searchParams.has('start');
    const closeParam = searchParams.has('close');
    console.log(startParam)


    if (!teamId) {
        return NextResponse.json({ error: 'Invalid team ID' }, { status: 400 });
    }
    if (!sprintId) {
        if (startParam) {
            console.log('starting next sprint')
            // Get next sprint
            // set to current sprint
            // set next sprint to null
            const team = await prisma.team.findFirst({
                where: {
                    id: teamId,
                },
                select: {
                    nextSprintId: true,
                }
            });

            if (!team?.nextSprintId) {
                console.log('no team id')
                return NextResponse.json({ error: 'No next sprint found' }, { status: 400 });
            }
            await prisma.team.update({
                where: { id: teamId },
                data: {
                    currentSprintId: team.nextSprintId,
                    nextSprintId: null,
                },
            });
            return NextResponse.json({ message: 'Next sprint started' }, { status: 200 });
        } else if (closeParam) {
            // Get set current sprint to completed and set the team current sprint value to null
            const team = await prisma.team.findFirst({
                where: {
                    id: teamId,
                },
                select: {
                    currentSprintId: true,
                    nextSprintId: true,
                }
            });

            if (!team?.currentSprintId) {
                return NextResponse.json({ error: 'No current sprint found' }, { status: 400 });
            }

            const sprint = await prisma.sprint.update({
                where: { id: team.currentSprintId },
                data: {
                    completed: true,
                },
            });
            // ticket reassignment
            let nextSprintId = team.nextSprintId;

            // next sprint doesn't exist, create it
            if (!nextSprintId) {
                const nextSprint = await prisma.sprint.create({
                    data: {
                        title: 'Next Sprint',
                        description: 'Placeholder description',
                        teamId: teamId,
                    },
                });
                await prisma.team.update({
                    where: { id: teamId },
                    data: {
                        nextSprintId: nextSprint.id,
                    },
                });
                nextSprintId = nextSprint.id;
            }
            // rollover tickets
            await prisma.ticket.updateMany({
                where: { sprintId: team.currentSprintId, status: { not: "CLOSED" } },
                data: {
                    sprintId: nextSprintId,
                },
            });
            await prisma.team.update({
                where: { id: teamId },
                data: {
                    currentSprintId: null,
                },
            });
            return NextResponse.json({ message: 'Current sprint closed' }, { status: 200 });
        }
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
