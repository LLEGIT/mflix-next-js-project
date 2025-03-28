import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

/**
 * @swagger
 * tags:
 *   - name: Comments
 *     description: Operations related to comments
 *
 * /api/comments:
 *   get:
 *     tags:
 *       - Comments
 *     summary: Retrieve comments
 *     description: Fetch comments from the database. Optionally filter by movie ID.
 *     parameters:
 *       - in: query
 *         name: movie_id
 *         schema:
 *           type: string
 *         description: The ID of the movie to filter comments by.
 *     responses:
 *       200:
 *         description: Comments retrieved successfully
 *       500:
 *         description: Internal Server Error
 *
 *   post:
 *     tags:
 *       - Comments
 *     summary: Create a new comment
 *     description: Endpoint to add a new comment to the database.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - movie_id
 *               - text
 *               - date
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               movie_id:
 *                 type: string
 *               text:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Comment created successfully
 *       400:
 *         description: Bad Request - Missing required fields
 *       500:
 *         description: Internal Server Error
 */

export async function GET(request) {
    try {
        const client = await clientPromise;
        const db = client.db('sample_mflix');

        const { searchParams } = new URL(request.url, `http://${request.headers.get('host')}`);
        const movieId = searchParams.get('movie_id');

        const query = movieId ? { movie_id: new ObjectId(movieId) } : {};
        const comments = await db.collection('comments').find(query).limit(10).toArray();

        return NextResponse.json(comments, { status: 200 });
    } catch (error) {
        console.log(error)
        return NextResponse.json(
            { message: 'Internal Server Error', error: error.message },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    try {
        const client = await clientPromise;
        const db = client.db('sample_mflix');
        const body = await request.json();

        const { name, email, movie_id, text, date } = body;

        if (!name || !email || !movie_id || !text || !date) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
        }

        const newComment = {
            name,
            email,
            movie_id: new ObjectId(movie_id),
            text,
            date: new Date(date),
        };

        const result = await db.collection('comments').insertOne(newComment);

        return NextResponse.json(
            { message: 'Comment created', commentId: result.insertedId },
            { status: 201 }
        );
    } catch (error) {
        return NextResponse.json(
            { message: 'Internal Server Error', error: error.message },
            { status: 500 }
        );
    }
}
