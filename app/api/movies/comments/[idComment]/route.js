import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

/**
 * @swagger
 * tags:
 *   - name: Comments
 *     description: Operations related to comments
 *
 * /api/comments/{idComment}:
 *   get:
 *     tags:
 *       - Comments
 *     summary: Retrieve a comment by ID
 *     description: Fetch a comment from the database using its ID.
 *     parameters:
 *       - in: path
 *         name: idComment
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the comment to retrieve.
 *     responses:
 *       200:
 *         description: Comment retrieved successfully
 *       400:
 *         description: Bad Request - Invalid comment ID
 *       404:
 *         description: Comment not found
 *       500:
 *         description: Internal Server Error
 *
 *   put:
 *     tags:
 *       - Comments
 *     summary: Update a comment by ID
 *     description: Update the details of a comment in the database using its ID.
 *     parameters:
 *       - in: path
 *         name: idComment
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the comment to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the commenter.
 *               email:
 *                 type: string
 *                 description: The email of the commenter.
 *               movie_id:
 *                 type: string
 *                 description: The ID of the movie the comment is associated with.
 *               text:
 *                 type: string
 *                 description: The text of the comment.
 *               date:
 *                 type: string
 *                 format: date-time
 *                 description: The date and time the comment was made.
 *     responses:
 *       200:
 *         description: Comment updated successfully
 *       400:
 *         description: Bad Request - Invalid comment ID
 *       404:
 *         description: Comment not found
 *       500:
 *         description: Internal Server Error
 *
 *   delete:
 *     tags:
 *       - Comments
 *     summary: Delete a comment by ID
 *     description: Remove a comment from the database using its ID.
 *     parameters:
 *       - in: path
 *         name: idComment
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the comment to delete.
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 *       400:
 *         description: Bad Request - Invalid comment ID
 *       404:
 *         description: Comment not found
 *       500:
 *         description: Internal Server Error
 */
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
