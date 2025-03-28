import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request, { params }) {
    try {
        const client = await clientPromise;
        const db = client.db('sample_mflix');

        const { idTheater } = params;
        if (!ObjectId.isValid(idTheater)) {
            return NextResponse.json(
                { message: 'Invalid theater ID', error: 'ID format is incorrect' },
                { status: 400 }
            );
        }

        const theater = await db.collection('theaters').findOne({ _id: new ObjectId(idTheater) });

        if (!theater) {
            return NextResponse.json(
                { message: 'Theater not found', error: 'No theater found with the given ID' },
                { status: 404 }
            );
        }

        return NextResponse.json({ data: { theater } }, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { message: 'Internal Server Error', error: error.message },
            { status: 500 }
        );
    }
}

export async function PUT(request, { params }) {
    try {
        const client = await clientPromise;
        const db = client.db('sample_mflix');
        const body = await request.json();
        const { theaterId } = params;

        if (isNaN(theaterId)) {
            return NextResponse.json(
                { message: 'Invalid theater ID', error: 'ID format is incorrect' },
                { status: 400 }
            );
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
            return NextResponse.json(
                { message: 'Theater not found', error: 'No theater found with the given ID' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { message: 'Theater updated', data: { theaterId } },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            { message: 'Internal Server Error', error: error.message },
            { status: 500 }
        );
    }
}

export async function DELETE(request, { params }) {
    try {
        const client = await clientPromise;
        const db = client.db('sample_mflix');
        const { idTheater } = params;

        if (isNaN(idTheater)) {
            return NextResponse.json(
                { message: 'Invalid theater ID', error: 'ID format is incorrect' },
                { status: 400 }
            );
        }

        const result = await db.collection('theaters').deleteOne({ idTheater: parseInt(idTheater) });

        if (result.deletedCount === 0) {
            return NextResponse.json(
                { message: 'Theater not found', error: 'No theater found with the given ID' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { message: 'Theater deleted', data: { idTheater } },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            { message: 'Internal Server Error', error: error.message },
            { status: 500 }
        );
    }
}
