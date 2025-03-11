import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
/*
import { organizationSchema } from '@/lib/schema';
// GET /api/organization
export async function GET() {
    try {
        // Fetch all organizations
        const organizations = await prisma.organization.findMany({
            select: {
                id: true,
                name: true,
                description: true,
                teams: {
                    select: {
                        id: true, name: true, description: true
                    }
                },
            },
        });
        return NextResponse.json(organizations);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch organizations' }, { status: 500 });
    }
}

// POST /api/organization
export async function POST(request: NextRequest) {

    // Parse the request body and validate it against the organization schema
    const body = await request.json();
    const validationResult = organizationSchema.safeParse(body);

    if (!validationResult.success) {
        return NextResponse.json({ error: validationResult.error }, { status: 400 });
    }

    try {
        // Create a new organization
        const organization = await prisma.organization.create({
            data: body,
        });
        return NextResponse.json(organization, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to create organization' }, { status: 500 });
    }
}
*/