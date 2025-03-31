import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/db'
import { ticketSchema } from '@/src/lib/schema';

// GET /api/tickets/:teamId
// GET /api/tickets/:teamId/:ticketId
export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
    const { slug } = await params;
    const teamId = slug[0];
    const ticketId = slug[1];

    if (!teamId) {
        return NextResponse.json({ error: 'Invalid team ID' }, { status: 400 });
    }

    // If ticketId is not provided, return all tickets for the team
    if (!ticketId) {
        try {
            const team = await prisma.team.findFirst({
                where: {
                    id: teamId,
                }, select: {
                    currentSprintId: true,
                    nextSprintId: true,
                    TeamRoles: {
                        select: {
                            User: {
                                select: {
                                    id: true,
                                    name: true,
                                    image: true,
                                }
                            }
                        }
                    }
                }
            });

            if (!team) {
                return NextResponse.json({ error: 'Team not found' }, { status: 404 });
            }

            // Fetch all tickets for the team
            const tickets = await prisma.ticket.findMany({
                where: {
                    teamId: teamId,
                    OR: [{ sprintId: team.currentSprintId }, { sprintId: team.nextSprintId }, { sprintId: null }],
                },
                select: {
                    id: true,
                    title: true,
                    description: true,
                    priority: true,
                    createdAt: true,
                    status: true,
                    assignee: {
                        select: {
                            id: true,
                            image: true,
                            name: true,
                        },
                    },
                    sprintId: true,
                    Sprint: {
                        select: {
                            id: true,
                            title: true,
                        }
                    }
                }
            });



            return NextResponse.json({ team, tickets }, { status: 200 });
        } catch (error) {
            return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: 500 });
        }
    } else {
        try {
            // If ticketId is provided, return the specific ticket
            const ticket = await prisma.ticket.findFirst({
                where: {
                    teamId: teamId,
                    id: ticketId,
                },
                select: {
                    id: true,
                    title: true,
                    description: true,
                    status: true,
                    priority: true,
                    assignee: {
                        select: {
                            id: true,
                            image: true,
                            name: true,
                        },
                    },
                    reporter: {
                        select: {
                            id: true,
                            image: true,
                            name: true,
                        }
                    },
                    createdAt: true,
                    updatedAt: true,
                },
            });
            if (!ticket) {
                return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
            }
            return NextResponse.json(ticket, { status: 200 });
        } catch (error) {
            return NextResponse.json({ error: 'Failed to fetch ticket' }, { status: 500 });
        }
    }
}

// POST /api/tickets/:teamId
export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
    const { slug } = await params;
    const teamId = slug[0];

    if (!teamId) {
        return NextResponse.json({ error: 'Invalid team ID' }, { status: 400 });
    }

    // Parse the request body and validate it against the ticket schema
    let body = await req.json();
    const validationResult = ticketSchema.safeParse({ ...body, status: 'OPEN' });

    if (!validationResult.success) {
        console.log(validationResult.error)
        return NextResponse.json({ error: validationResult.error.errors }, { status: 400 });
    }

    try {
        // Extract tags from the request body and delete them from the body
        const tags = body.tags || [];
        delete body.tags;

        const row = {
            ...body,
            teamId,
            status: 'OPEN',
            reporterId: "cm85696e60000vwbkm55ax25t", // Hardcoded for now
        };

        // Create a new ticket
        const ticket = await prisma.ticket.create({
            data: row,
        });
        return NextResponse.json(ticket, { status: 201 });
    } catch (error) {
        console.log(error)
        return NextResponse.json({ error: 'Failed to create ticket' }, { status: 500 });
    }
}

// PUT /api/tickets/:teamId/:ticketId
export async function PUT(req: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
    const { slug } = await params;
    const teamId = slug[0];
    const ticketId = slug[1];

    const { searchParams } = new URL(req.url);
    // if sprintId is provided, it means the ticket is created for
    const sprintId = searchParams.get('sprintId');
    const status = searchParams.get('status');

    if (!teamId) {
        return NextResponse.json({ error: 'Invalid team ID' }, { status: 400 });
    }
    if (!ticketId) {
        return NextResponse.json({ error: 'Invalid ticket ID' }, { status: 400 });
    }

    if (sprintId) {
        try {
            let appliedSprintId = null;
            if (sprintId !== 'null') {
                appliedSprintId = sprintId;
            }
            // Update the ticket with the provided sprint ID
            const ticket = await prisma.ticket.update({
                where: {
                    id: ticketId,
                },
                data: {
                    sprintId: appliedSprintId,
                },
            });
            return NextResponse.json(ticket, { status: 200 });
        } catch (error) {
            return NextResponse.json({ error: 'Failed to update ticket' }, { status: 500 });
        }
    } else if (status) {
        try {
            // Update the ticket with the provided status
            const ticket = await prisma.ticket.update({
                where: {
                    id: ticketId,
                },
                data: {
                    status,
                },
            });
            return NextResponse.json(ticket, { status: 200 });
        } catch (error) {
            return NextResponse.json({ error: 'Failed to update ticket' }, { status: 500 });
        }
    }
    // Parse the request body and validate it against the ticket schem
    const body = await req.json();
    const validationResult = ticketSchema.safeParse({ ...body, teamId, status: body.status || 'OPEN' });

    if (!validationResult.success) {
        console.log(validationResult.error)
        return NextResponse.json({ error: validationResult.error.errors }, { status: 400 });
    }

    try {
        // Update the ticket
        const ticket = await prisma.ticket.update({
            where: {
                id: ticketId,
            },
            data: {
                title: body.title,
                description: body.description,
                status: body.status,
                assigneeId: body.assigneeId,
            },
        });
        return NextResponse.json(ticket, { status: 200 });
    } catch (error) {
        console.log(error)
        return NextResponse.json({ error: 'Failed to update ticket' }, { status: 500 });
    }
}

// DELETE /api/tickets/:teamId/:ticketId
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
    const { slug } = await params;
    const teamId = slug[0];
    const ticketId = slug[1];

    if (!teamId) {
        return NextResponse.json({ error: 'Invalid team ID' }, { status: 400 });
    }
    if (!ticketId) {
        return NextResponse.json({ error: 'Invalid ticket ID' }, { status: 400 });
    }

    try {
        // Delete the ticket with the provided ID
        const ticket = await prisma.ticket.delete({
            where: {
                id: ticketId,
            },
        });
        return NextResponse.json(ticket, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete ticket' }, { status: 500 });
    }
}