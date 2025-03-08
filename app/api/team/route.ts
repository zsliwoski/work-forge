import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { teamSchema } from '@/lib/schema';

// GET /api/team
export async function GET() {
    try {
        // Fetch all teams
        const teams = await prisma.team.findMany({
            select: {
                id: true,
                name: true,
                description: true,
                members: {
                    select: {
                        id: true, image: true, name: true, role: true
                    }
                },
            },
        });
        return NextResponse.json(teams);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch teams' }, { status: 500 });
    }
}

// POST /api/team
export async function POST(request: NextRequest) {

    // Parse the request body and validate it against the team schema
    const body = await request.json();
    const validationResult = teamSchema.safeParse(body);

    if (!validationResult.success) {
        return NextResponse.json({ error: validationResult.error }, { status: 400 });
    }

    try {
        // Create a new team
        const team = await prisma.team.create({
            data: body,
        });
        return NextResponse.json(team, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to create team' }, { status: 500 });
    }
}