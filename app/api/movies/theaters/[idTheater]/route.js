import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

/**
 * @swagger
 * tags:
 *   - name: Theaters
 *     description: Operations related to theaters
 *
 * /api/theaters/{idTheater}:
 *   get:
 *     tags:
 *       - Theaters
 *     summary: Retrieve a theater by ID
 *     description: Fetch a theater from the database using its ID.
 *     parameters:
 *       - in: path
 *         name: idTheater
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the theater to retrieve.
 *     responses:
 *       200:
 *         description: Theater retrieved successfully
 *       400:
 *         description: Bad Request - Invalid theater ID
 *       404:
 *         description: Theater not found
 *       500:
 *         description: Internal Server Error
 *
 *   put:
 *     tags:
 *       - Theaters
 *     summary: Update a theater by ID
 *     description: Update the details of a theater in the database using its ID.
 *     parameters:
 *       - in: path
 *         name: theaterId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the theater to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               location:
 *                 type: object
 *                 properties:
 *                   address:
 *                     type: object
 *                     properties:
 *                       street1:
 *                         type: string
 *                         description: Street address of the theater.
 *                       city:
 *                         type: string
 *                         description: City where the theater is located.
 *                       state:
 *                         type: string
 *                         description: State where the theater is located.
 *                       zipcode:
 *                         type: string
 *                         description: Zip code of the theater's location.
 *                   geo:
 *                     type: object
 *                     properties:
 *                       type:
 *                         type: string
 *                         enum: [Point]
 *                         description: GeoJSON type (must be 'Point').
 *                       coordinates:
 *                         type: array
 *                         items:
 *                           type: number
 *                         description: Geographical coordinates of the theater.
 *     responses:
 *       200:
 *         description: Theater updated successfully
 *       400:
 *         description: Bad Request - Invalid theater ID
 *       404:
 *         description: Theater not found
 *       500:
 *         description: Internal Server Error
 *
 *   delete:
 *     tags:
 *       - Theaters
 *     summary: Delete a theater by ID
 *     description: Remove a theater from the database using its ID.
 *     parameters:
 *       - in: path
 *         name: idTheater
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the theater to delete.
 *     responses:
 *       200:
 *         description: Theater deleted successfully
 *       400:
 *         description: Bad Request - Invalid theater ID
 *       404:
 *         description: Theater not found
 *       500:
 *         description: Internal Server Error
 */
export async function GET(request, { params }) {
    try {
        const client = await clientPromise;
        const db = client.db('sample_mflix');

        const { idTheater } = params;
        if (!ObjectId.isValid(idTheater)) {
            return NextResponse.json({ status: 400, message: 'Invalid theater ID', error: 'ID format is incorrect' });
        }

        const theater = await db.collection('theaters').findOne({ _id: new ObjectId(idTheater) });

        if (!theater) {
            return NextResponse.json({ status: 404, message: 'theater not found', error: 'No theater found with the given ID' });
        }

        return NextResponse.json({ status: 200, data: { theater } });
    } catch (error) {
        return NextResponse.json({ status: 500, message: 'Internal Server Error', error: error.message });
    }
}

export async function PUT(request, { params }) {
    try {
        const client = await clientPromise;
        const db = client.db('sample_mflix');
        const body = await request.json();
        const { theaterId } = params;

        if (isNaN(theaterId)) {
            return NextResponse.json({ status: 400, message: 'Invalid theater ID', error: 'ID format is incorrect' });
        }

        const updateData = {
            location: {
                address: {
                    street1: body.location.address.street1,
                    city: body.location.address.city,
                    state: body.location.address.state,
                    zipcode: body.location.address.zipcode
                },
                geo: {
                    type: "Point",
                    coordinates: body.location.geo.coordinates
                }
            }
        };

        const result = await db.collection('theaters').updateOne(
            { theaterId: parseInt(theaterId) },
            { $set: updateData }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json({ status: 404, message: 'Theater not found', error: 'No theater found with the given ID' });
        }

        return NextResponse.json({ status: 200, message: 'Theater updated', data: { theaterId } });
    } catch (error) {
        return NextResponse.json({ status: 500, message: 'Internal Server Error', error: error.message });
    }
}

export async function DELETE(request, { params }) {
    try {
        const client = await clientPromise;
        const db = client.db('sample_mflix');
        const { idTheater } = params;

        if (isNaN(idTheater)) {
            return NextResponse.json({ status: 400, message: 'Invalid theater ID', error: 'ID format is incorrect' });
        }

        const result = await db.collection('theaters').deleteOne({ idTheater: parseInt(idTheater) });

        if (result.deletedCount === 0) {
            return NextResponse.json({ status: 404, message: 'Theater not found', error: 'No theater found with the given ID' });
        }

        return NextResponse.json({ status: 200, message: 'Theater deleted', data: { idTheater } });
    } catch (error) {
        return NextResponse.json({ status: 500, message: 'Internal Server Error', error: error.message });
    }
}
