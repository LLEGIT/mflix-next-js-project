import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

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
