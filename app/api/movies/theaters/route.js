import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
    try {
        const client = await clientPromise;
        const db = client.db('sample_mflix');
        const theaters = await db.collection('theaters').find({}).limit(10).toArray();

        return NextResponse.json(
            { status: 200, data: theaters }
        );
    }
    catch (error) {
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
        if (!body.theaterId || !body.location || !body.location.address || !body.location.geo) {
            return NextResponse.json({ status: 400, message: 'Missing required fields' });
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
        return NextResponse.json({ status: 201, message: 'Theater created', data: { theaterId: result.insertedId } });
    } catch (error) {
        return NextResponse.json({ status: 500, message: 'Internal Server Error', error: error.message });
    }
}
