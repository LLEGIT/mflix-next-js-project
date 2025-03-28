import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

/**
 * @swagger
 * tags:
 *   - name: Theaters
 *     description: Operations related to theaters
 *
 * /api/theaters:
 *   get:
 *     tags:
 *       - Theaters
 *     summary: Retrieve a list of theaters
 *     description: Fetch up to 10 theaters from the database.
 *     responses:
 *       200:
 *         description: Successfully retrieved theaters
 *       500:
 *         description: Internal Server Error
 *
 *   post:
 *     tags:
 *       - Theaters
 *     summary: Create a new theater
 *     description: Endpoint to add a new theater to the database.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               theaterId:
 *                 type: string
 *                 description: Unique identifier for the theater.
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
 *       201:
 *         description: Theater created successfully
 *       400:
 *         description: Bad Request - Missing required fields
 *       500:
 *         description: Internal Server Error
 */
export async function GET() {
    try {
        const client = await clientPromise;
        const db = client.db('sample_mflix');
        const theaters = await db.collection('theaters').find({}).limit(10).toArray();

        return NextResponse.json(
            { status: 200, data: theaters },
            { status: 200 }
        );
    }
    catch (error) {
        return NextResponse.json(
            { status: 500, message: 'Internal Server Error', error: error.message },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    try {
        const client = await clientPromise;
        const db = client.db('sample_mflix');
        const body = await request.json();

        // Validate the request body
        if (!body.theaterId || !body.location || !body.location.address || !body.location.geo) {
            return NextResponse.json({ status: 400, message: 'Missing required fields' }, { status: 400 });
        }

        const newTheater = {
            theaterId: body.theaterId,
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

        const result = await db.collection('theaters').insertOne(newTheater);
        return NextResponse.json({ status: 201, message: 'Theater created', data: { theaterId: result.insertedId } }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ status: 500, message: 'Internal Server Error', error: error.message }, { status: 500 });
    }
}
