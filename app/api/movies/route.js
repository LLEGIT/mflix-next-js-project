import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
    try {
        const client = await clientPromise;
        const db = client.db('sample_mflix');
        const movies = await db.collection('movies').find({}).limit(10).toArray();

        return NextResponse.json(
            { status: 200, data: movies }
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
        if (!body.title || !body.plot || !body.genres || !body.runtime) {
            return NextResponse.json({ status: 400, message: 'Missing required fields' });
        }

        const newMovie = {
            title: body.title,
            plot: body.plot,
            genres: body.genres,
            runtime: body.runtime,
            cast: body.cast || [],
            poster: body.poster || '',
            fullplot: body.fullplot || '',
            languages: body.languages || [],
            released: body.released || new Date().toISOString(),
            directors: body.directors || [],
            rated: body.rated || '',
            awards: body.awards || {},
            year: body.year || new Date().getFullYear(),
            imdb: body.imdb || {},
            countries: body.countries || [],
            type: body.type || 'movie',
            tomatoes: body.tomatoes || {},
            num_mflix_comments: body.num_mflix_comments || 0
        };

        const result = await db.collection('movies').insertOne(newMovie);
        return NextResponse.json({ status: 201, message: 'Movie created', data: { movieId: result.insertedId } });
    } catch (error) {
        return NextResponse.json({ status: 500, message: 'Internal Server Error', error: error.message });
    }
}
