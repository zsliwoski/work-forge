import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
    const { slug } = await params;
    console.log(slug)
    const teamId = slug[0];
    const ticketId = slug[1];

    if (!teamId) {
        return NextResponse.json({ error: 'Invalid team ID' }, { status: 400 });
    }
    if (!ticketId) {
        try {
            const tickets = await prisma.ticket.findMany({
                where: {
                    teamId: teamId,
                },
            });
            return NextResponse.json(tickets, { status: 200 });
        } catch (error) {
            return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: 500 });
        }
    } else {
        try {
            const ticket = await prisma.ticket.findFirst({
                where: {
                    teamId: teamId,
                    id: ticketId,
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

export async function POST() {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}