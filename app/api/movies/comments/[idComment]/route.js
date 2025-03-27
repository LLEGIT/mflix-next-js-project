import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request, { params }) {
    try {
        const client = await clientPromise;
        const db = client.db('sample_mflix');

        const { idComment } = params;
        if (!ObjectId.isValid(idComment)) {
            return NextResponse.json({ status: 400, message: 'Invalid comment ID', error: 'ID format is incorrect' });
        }

        const comment = await db.collection('comments').findOne({ _id: new ObjectId(idComment) });

        if (!comment) {
            return NextResponse.json({ status: 404, message: 'comment not found', error: 'No comment found with the given ID' });
        }

        return NextResponse.json({ status: 200, data: { comment } });
    } catch (error) {
        return NextResponse.json({ status: 500, message: 'Internal Server Error', error: error.message });
    }
}

export async function PUT(request, { params }) {
    try {
        const client = await clientPromise;
        const db = client.db('sample_mflix');
        const body = await request.json();
        const { idComment } = params;

        if (!idComment) {
            return NextResponse.json({ status: 400, message: 'Invalid comment ID', error: 'ID format is incorrect' });
        }

        const updateData = {
            name: body.name,
            email: body.email,
            movie_id: new ObjectId(body.movie_id), // Ensure movie_id is converted to ObjectId if necessary
            text: body.text,
            date: new Date(body.date) // Ensure date is converted to a Date object if necessary
        };

        const result = await db.collection('comments').updateOne(
            { _id: new ObjectId(idComment) },
            { $set: updateData }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json({ status: 404, message: 'Comment not found', error: 'No comment found with the given ID' });
        }

        return NextResponse.json({ status: 200, message: 'Comment updated', data: { idComment } });
    } catch (error) {
        return NextResponse.json({ status: 500, message: 'Internal Server Error', error: error.message });
    }
}

export async function DELETE(request, { params }) {
    try {
        const client = await clientPromise;
        const db = client.db('sample_mflix');
        const { idComment } = params;

        if (!ObjectId.isValid(idComment)) {
            return NextResponse.json({ status: 400, message: 'Invalid comment ID', error: 'ID format is incorrect' });
        }

        const result = await db.collection('comments').deleteOne({ _id: new ObjectId(idComment) });

        if (result.deletedCount === 0) {
            return NextResponse.json({ status: 404, message: 'Comment not found', error: 'No comment found with the given ID' });
        }

        return NextResponse.json({ status: 200, message: 'Comment deleted', data: { idComment } });
    } catch (error) {
        return NextResponse.json({ status: 500, message: 'Internal Server Error', error: error.message });
    }
}
