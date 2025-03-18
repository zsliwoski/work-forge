import { NextApiRequest, NextApiResponse } from 'next';
import { NextRequest, NextResponse } from 'next/server';
import { sendInviteEmail } from '@/actions/send-email';
import { z } from 'zod';
import { teamInviteSchema } from '@/lib/schema';
import { prisma } from '@/lib/db';
import { getToken } from 'next-auth/jwt';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const teamId = searchParams.get('teamId');
    return NextResponse.json({ message: `Fetching data for team ${teamId}` });
}

export async function POST(req: NextRequest, params: { teamId: string }) {
    const { teamId } = params;
    const invitePage = process.env.INVITE_URL;

    if (!invitePage) {
        return NextResponse.json({ error: 'Invite page not found' }, { status: 500 });
    }

    const token = await getToken({
        req,
        raw: true
    });

    if (!token) {
        return NextResponse.json({ error: 'User Authentication is required' }, { status: 401 });
    }

    // Extract the email and role from the request body
    const body = await req.json();

    // Validate the request body
    const validationResult = teamInviteSchema.safeParse(body);

    if (!validationResult.success) {
        return NextResponse.json({ error: validationResult.error }, { status: 400 });
    }

    const { email, role } = validationResult.data;

    try {
        const userSession = await prisma.session.findFirst({ where: { sessionToken: token }, select: { userId: true } });

        if (!userSession) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Check if the team exists, and grab the roles
        const team = await prisma.team.findUnique({
            where: { id: teamId },
            select: {
                id: true,
                name: true,
                TeamRoles: {
                    select: {
                        User: {
                            select: {
                                email: true,
                            }
                        },
                        userId: true,
                        role: true,
                    },
                }
            }
        });

        if (!team) {
            return NextResponse.json({ error: 'Team not found' }, { status: 404 });
        }

        const inviterRole = team?.TeamRoles.find(role => role.userId === userSession.userId);
        const inviteeRole = team?.TeamRoles.find(role => role.userId === email);

        if (!inviterRole)
            return NextResponse.json({ error: 'You are not a member of this team' }, { status: 403 });

        if (inviteeRole)
            return NextResponse.json({ error: 'User is already a member of this team' }, { status: 403 });

        // Check if the inviter has the required role to invite users
        // Note: we only check the first role, as the inviter can only have one role in a team
        // If the inviter has a role of 1, they can invite users with roles 1 and 2
        if (inviterRole?.role >= role) {
            return NextResponse.json({ error: `You do not have the required permissions to invite users at this role` }, { status: 403 });
        }

        // Create the invite
        const invite = await prisma.teamInvite.create({
            data: {
                email,
                role,
                teamId,
            },
        });

        // Create the invite link
        const inviteLink = `${invitePage}?inviteId=${invite.id}`;

        // Send the invite email
        const emailSuccess = await sendInviteEmail({
            email,
            teamName: team.name,
            inviteLink,
        });

        if (!emailSuccess) {
            return NextResponse.json({ error: 'Failed to send invite email' }, { status: 500 });
        }

        return NextResponse.json({ message: 'Invite sent successfully' });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to send invite email' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const teamId = searchParams.get('teamId');
    return NextResponse.json({ message: `Deleting invite for team ${teamId}` });
}
