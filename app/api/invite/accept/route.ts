import { prisma } from '@/lib/db';
import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const inviteId = searchParams.get('inviteId');

    if (!inviteId) {
        return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const token = await getToken({
        req,
        raw: true
    });

    if (!token) {
        return NextResponse.json({ error: 'User Authentication is required' }, { status: 401 });
    }

    try {
        // Fetch the user session, check authentication
        const userSession = await prisma.session.findFirst({ where: { sessionToken: token }, select: { user: { select: { id: true, email: true } } } });

        if (!userSession) {
            return NextResponse.json({ error: 'User Session not found' }, { status: 404 });
        }

        const invite = await prisma.teamInvite.findFirst({
            where: {
                id: inviteId,
            }
        });

        if (!invite) {
            return NextResponse.json({ error: 'Invite not found' }, { status: 404 });
        }

        if (invite.email !== userSession.user.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Create a role for the user
        try {
            await prisma.userToTeam.create({
                data: {
                    role: invite.role,
                    userId: userSession.user.id,
                    teamId: invite.teamId
                }
            });

        } catch (error) {
            throw new Error('Failed to create role');
        }

        // Delete the invite
        try {
            await prisma.teamInvite.delete({
                where: {
                    id: inviteId
                }
            });
        } catch (error) {
            throw new Error('Failed to delete invite');
        }


        const fullRole = await prisma.userToTeam.findFirst({
            where: {
                teamId: invite.teamId,
                userId: userSession.user.id
            }, select: {
                role: true,
                Team: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });

        if (!fullRole) {
            return NextResponse.json({ error: 'Failed to fetch created role' }, { status: 500 });
        }

        return NextResponse.json(fullRole);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to accept invite' }, { status: 500 });
    }
}