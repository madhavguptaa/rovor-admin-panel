import { NextResponse } from 'next/server';
import { getMongoDb } from '@/lib/mongodb';

export async function GET() {
    try {
        const db = await getMongoDb();
        const tickets = await db.collection('supportTickets').find({}).sort({ updatedAt: -1 }).limit(200).toArray();

        return NextResponse.json({
            success: true,
            data: tickets.map((ticket) => ({
                ...ticket,
                _id: ticket._id?.toString(),
            })),
        });
    } catch (error) {
        console.error('Error fetching tickets', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Failed to load tickets',
            },
            { status: 500 }
        );
    }
}

