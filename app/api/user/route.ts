import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getToken } from 'next-auth/jwt';
import { getServerSession } from 'next-auth';

export async function GET(req: NextRequest) {
    //console.log(req)
    const token = await getToken({
        req,
        raw: true
    });

    if (!token) {
        return NextResponse.json({ error: 'User Authentication is required' }, { status: 401 });
    }

    try {
        const userSession = await prisma.session.findFirst({ where: { sessionToken: token }, select: { userId: true } });
        if (!userSession) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        const user = await prisma.user.findFirst({
            where: { id: userSession.userId },
            select: {
                TeamRoles: {
                    select: {
                        role: true,
                        Team: {
                            select: {
                                id: true,
                                name: true,
                                Organization: {
                                    select: {
                                        id: true,
                                        name: true
                                    }
                                }
                            }
                        }
                    }
                }
            },
        });
        console.log(user)
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
    }
}
