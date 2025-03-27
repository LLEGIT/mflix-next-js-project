import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request, { params }) {
    try {
        const client = await clientPromise;
        const db = client.db('sample_mflix');

        const { idMovie } = params;
        if (!ObjectId.isValid(idMovie)) {
            return NextResponse.json({ status: 400, message: 'Invalid movie ID', error: 'ID format is incorrect' });
        }

        const movie = await db.collection('movies').findOne({ _id: new ObjectId(idMovie) });

        if (!movie) {
            return NextResponse.json({ status: 404, message: 'Movie not found', error: 'No movie found with the given ID' });
        }

        return NextResponse.json({ status: 200, data: { movie } });
    } catch (error) {
        return NextResponse.json({ status: 500, message: 'Internal Server Error', error: error.message });
    }
}

export async function PUT(request, { params }) {
    try {
        const client = await clientPromise;
        const db = client.db('sample_mflix');
        const body = await request.json();
        const { idMovie } = params;

        if (!ObjectId.isValid(idMovie)) {
            return NextResponse.json({ status: 400, message: 'Invalid movie ID', error: 'ID format is incorrect' });
        }

        const updateData = {
            title: body.title,
            plot: body.plot,
            genres: body.genres,
            runtime: body.runtime,
            cast: body.cast,
            poster: body.poster,
            fullplot: body.fullplot,
            languages: body.languages,
            released: body.released,
            directors: body.directors,
            rated: body.rated,
            awards: body.awards,
            year: body.year,
            imdb: body.imdb,
            countries: body.countries,
            type: body.type,
            tomatoes: body.tomatoes,
            num_mflix_comments: body.num_mflix_comments
        };

        const result = await db.collection('movies').updateOne(
            { _id: new ObjectId(idMovie) },
            { $set: updateData }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json({ status: 404, message: 'Movie not found', error: 'No movie found with the given ID' });
        }

        return NextResponse.json({ status: 200, message: 'Movie updated', data: { movieId: idMovie } });
    } catch (error) {
        return NextResponse.json({ status: 500, message: 'Internal Server Error', error: error.message });
    }
}

export async function DELETE(request, { params }) {
    try {
        const client = await clientPromise;
        const db = client.db('sample_mflix');
        const { idMovie } = params;

        if (!ObjectId.isValid(idMovie)) {
            return NextResponse.json({ status: 400, message: 'Invalid movie ID', error: 'ID format is incorrect' });
        }

        const result = await db.collection('movies').deleteOne({ _id: new ObjectId(idMovie) });

        if (result.deletedCount === 0) {
            return NextResponse.json({ status: 404, message: 'Movie not found', error: 'No movie found with the given ID' });
        }

        return NextResponse.json({ status: 200, message: 'Movie deleted', data: { movieId: idMovie } });
    } catch (error) {
        return NextResponse.json({ status: 500, message: 'Internal Server Error', error: error.message });
    }
}
