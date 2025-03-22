import { NextResponse } from 'next/server';
import { prisma } from '@/src/lib/db';
import { teamSchema } from '@/src/lib/schema';

// GET /api/team/:teamId
export async function GET(request: Request, { params }: { params: Promise<{ teamId: string }> }) {
    const { teamId } = await params;
    console.log(teamId)
    if (!teamId) {
        return NextResponse.json({ error: 'Team ID is required' }, { status: 400 });
    }

    try {
        const team = await prisma.team.findFirst({
            where: { id: teamId },
            select: {
                name: true,
                description: true,
                TeamRoles: {
                    select: {
                        User: {
                            select: {
                                id: true,
                                image: true,
                                name: true,
                            }
                        },
                        role: true,
                    }
                },
            },
        });

        if (!team) {
            return NextResponse.json({ error: 'Team not found' }, { status: 404 });
        }

        return NextResponse.json(team);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to fetch team' }, { status: 500 });
    }
}

// PUT /api/wiki/:teamId
export async function PUT(request: Request, { params }: { params: Promise<{ teamId: string }> }) {
    const { teamId } = await params;

    if (!teamId) {
        return NextResponse.json({ error: 'Team ID is required' }, { status: 400 });
    }

    // Parse the request body and validate it against the article schema
    const body = await request.json();
    const validationResult = teamSchema.safeParse(body);

    if (!validationResult.success) {
        return NextResponse.json({ error: validationResult.error }, { status: 400 });
    }

    try {
        const team = await prisma.team.update({
            where: { id: teamId },
            data: body,
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to update team' }, { status: 500 });
    }
}

// DELETE /api/wiki/:teamId
export async function DELETE(request: Request, { params }: { params: Promise<{ teamId: string }> }) {
    const { teamId } = await params;

    if (!teamId) {
        return NextResponse.json({ error: 'Team ID is required' }, { status: 400 });
    }

    try {
        // Delete the article
        const team = await prisma.team.delete({
            where: { id: teamId },
        });
        return NextResponse.json(team);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to delete team' }, { status: 500 });
    }
}

// POST /api/team/:orgId
export async function POST(request: Request, { params }: { params: Promise<{ organizationId: string }> }) {

    const { organizationId } = await params;

    if (!organizationId) {
        return NextResponse.json({ error: 'Organization ID is required' }, { status: 400 });
    }

    // Parse the request body and validate it against the team schema
    const body = await request.json();
    const validationResult = teamSchema.safeParse(body);

    if (!validationResult.success) {
        return NextResponse.json({ error: validationResult.error }, { status: 400 });
    }

    try {
        const invitations = body.invitations;
        delete body.invitations;

        // Create a new team
        const team = await prisma.team.create({
            data: {
                ...body, organizationId
            }
        });

        if (invitations) {
            await prisma.teamInvite.createMany({
                data: invitations.map((email: string, role: number | null) => ({
                    email,
                    role,
                    teamId: team.id,
                }))
            });
        }

        return NextResponse.json(team, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to create team' }, { status: 500 });
    }
}