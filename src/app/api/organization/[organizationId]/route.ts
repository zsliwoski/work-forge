import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/db';
import { getToken } from 'next-auth/jwt';

//GET /api/organization
export async function GET(req: NextRequest, { params }: { params: Promise<{ organizationId: string }> }) {
    const { organizationId } = await params;

    if (!organizationId) {
        return NextResponse.json({ error: 'Organization ID is required' }, { status: 400 });
    }

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
            return NextResponse.json({ error: 'User Session not found' }, { status: 404 });
        }

        const organization = await prisma.organization.findFirst({
            where: { id: organizationId },
            select: {
                id: true,
                name: true,
                icon: true,
                description: true,
                Teams: {
                    select: {
                        id: true,
                        name: true,
                        icon: true,
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
                    }
                }
            }
        });

        return NextResponse.json(organization);

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to fetch organizations' }, { status: 500 });
    }
}