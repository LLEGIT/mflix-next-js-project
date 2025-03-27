import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request) {
    try {
        const client = await clientPromise;
        const db = client.db('sample_mflix');

        // Parse the query parameters from the request URL
        const { searchParams } = new URL(request.url, `http://${request.headers.host}`);
        const movieId = searchParams.get('movie_id');

        let query = {};
        if (movieId) {
            // If movie_id is provided, filter comments by movie_id
            query.movie_id = new ObjectId(movieId);
        }

        const comments = await db.collection('comments').find(query).limit(10).toArray();

        return NextResponse.json(
            { status: 200, data: comments }
        );
    } catch (error) {
        return NextResponse.json(
            { status: 500, message: 'Internal Server Error', error: error.message }
        );
    }
}

export async function POST(request) {
    try {
        const client = await clientPromise;
        const db = client.db('sample_mflix');
        const body = await request.json();

        // Validate the request body
        if (!body.name || !body.email || !body.movie_id || !body.text || !body.date) {
            return NextResponse.json({ status: 400, message: 'Missing required fields' });
        }

        const newComment = {
            name: body.name,
            email: body.email,
            movie_id: body.movie_id, // Ensure movie_id is converted to ObjectId if necessary
            text: body.text,
            date: new Date(body.date) // Ensure date is converted to a Date object if necessary
        };

        const result = await db.collection('comments').insertOne(newComment);
        return NextResponse.json({ status: 201, message: 'comment created', data: { commentId: result.insertedId } });
    } catch (error) {
        return NextResponse.json({ status: 500, message: 'Internal Server Error', error: error.message });
    }
}
