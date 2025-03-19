import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { organizationSchema } from '@/lib/schema';
import { getToken } from 'next-auth/jwt';
import { sendInviteEmail } from '@/actions/send-email';

// POST /api/organization
export async function POST(req: NextRequest) {
    const token = await getToken({
        req,
        raw: true
    });

    if (!token) {
        return NextResponse.json({ error: 'User Authentication is required' }, { status: 401 });
    }

    // Parse the request body and validate it against the organization schema
    const body = await req.json();
    const validationResult = organizationSchema.safeParse(body);

    if (!validationResult.success) {
        return NextResponse.json({ error: validationResult.error }, { status: 400 });
    }

    try {
        // Get the user session
        const userSession = await prisma.session.findFirst({ where: { sessionToken: token }, select: { userId: true } });

        if (!userSession) {
            return NextResponse.json({ error: 'User Session not found' }, { status: 404 });
        }

        // Create the organization
        const organization = await prisma.organization.create({
            data: {
                name: validationResult.data.name,
                icon: validationResult.data.icon,
                description: validationResult.data.description,
                ownerId: userSession.userId,
            }
        });

        // Create teams and assign the user to the team as admin, create invitations
        const teams = await prisma.team.createManyAndReturn({
            data: validationResult.data.teams.map((team) => ({
                name: team.name,
                icon: team.icon,
                description: team.description,
                organizationId: organization.id,
                TeamRoles: {
                    create: {
                        role: 0,
                        userId: userSession.userId,
                    }
                },
                TeamInvitations: {
                    create: team.invitations.map((invite) => ({
                        email: invite.email,
                        role: invite.role,
                    }))
                }
            }))
        });

        if (teams.length !== validationResult.data.teams.length) {
            return NextResponse.json({ error: 'Failed to create teams' }, { status: 500 });
        }

        // for every new team, send an invite email to the invited users
        for (const team of teams) {
            // Get the invitations for the team
            const invitations = await prisma.teamInvite.findMany({
                where: { teamId: team.id },
                select: {
                    id: true,
                    email: true,
                }
            });

            // Send the invite email
            for (const invite of invitations) {
                await sendInviteEmail({
                    email: invite.email,
                    teamName: team.name,
                    inviteId: invite.id,
                });
            }
        }



    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to create organization' }, { status: 500 });
    }
}
