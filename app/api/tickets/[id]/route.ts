import { NextRequest, NextResponse } from 'next/server';
import { getMongoDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const body = await request.json();
        const db = await getMongoDb();
        const collection = db.collection('supportTickets');

        const setPayload: Record<string, any> = {
            updatedAt: new Date().toISOString(),
        };

        if (body.status) {
            setPayload.status = body.status;
        }

        if (body.assignee !== undefined) {
            setPayload.assignee = body.assignee;
        }

        const pushPayload: Record<string, any> = {};

        if (body.note) {
            pushPayload.notes = {
                text: body.note,
                createdAt: new Date().toISOString(),
            };
        }

        if (body.message) {
            pushPayload.messages = {
                text: body.message,
                sender: body.sender === 'support' ? 'support' : 'customer',
                createdAt: new Date().toISOString(),
            };
        }

        const updateDoc: Record<string, any> = {};
        if (Object.keys(setPayload).length > 0) {
            updateDoc.$set = setPayload;
        }
        if (Object.keys(pushPayload).length > 0) {
            updateDoc.$push = pushPayload;
        }

        if (!updateDoc.$set && !updateDoc.$push) {
            return NextResponse.json({ success: false, message: 'No changes supplied' }, { status: 400 });
        }

        const result = await collection.updateOne({ _id: new ObjectId(id) }, updateDoc);

        if (result.matchedCount === 0) {
            return NextResponse.json({ success: false, message: 'Ticket not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Ticket updated' });
    } catch (error: any) {
        console.error('PATCH /api/tickets/[id] error:', error);
        return NextResponse.json({ success: false, message: error.message ?? 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const db = await getMongoDb();
        const collection = db.collection('supportTickets');

        const result = await collection.deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            return NextResponse.json({ success: false, message: 'Ticket not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Ticket deleted' });
    } catch (error: any) {
        console.error('DELETE /api/tickets/[id] error:', error);
        return NextResponse.json({ success: false, message: error.message ?? 'Internal server error' }, { status: 500 });
    }
}

