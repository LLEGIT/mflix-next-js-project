import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

/**
 * @swagger
 * /api/movies:
 *   get:
 *     tags:
 *       - Movies
 *     summary: Retrieve a list of movies
 *     description: Returns 10 movies from the db
 *     responses:
 *       200:
 *         description: Movies fetched
 *       500:
 *         description: Internal Server Error
 */
export async function GET() {
    try {
        const client = await clientPromise;
        const db = client.db('sample_mflix');
        const movies = await db.collection('movies').find({}).limit(50).toArray();

        return NextResponse.json(
            { status: 200, data: movies },
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

/**
 * @swagger
 * /api/movies:
 *   post:
 *     tags:
 *       - Movies
 *     summary: Create a new movie
 *     description: Endpoint to create a new movie in the database.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: The title of the movie.
 *               plot:
 *                 type: string
 *                 description: A brief plot summary of the movie.
 *               genres:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: An array of genres the movie belongs to.
 *               runtime:
 *                 type: integer
 *                 description: The runtime of the movie in minutes.
 *               cast:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: An array of cast members.
 *               poster:
 *                 type: string
 *                 description: URL of the movie poster.
 *               fullplot:
 *                 type: string
 *                 description: A full plot summary of the movie.
 *               languages:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: An array of languages spoken in the movie.
 *               released:
 *                 type: string
 *                 format: date-time
 *                 description: The release date of the movie.
 *               directors:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: An array of directors of the movie.
 *               rated:
 *                 type: string
 *                 description: The movie's rating.
 *               awards:
 *                 type: object
 *                 description: Awards won by the movie.
 *               year:
 *                 type: integer
 *                 description: The year the movie was released.
 *               imdb:
 *                 type: object
 *                 description: IMDb information about the movie.
 *               countries:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: An array of countries where the movie was produced.
 *               type:
 *                 type: string
 *                 description: The type of the movie (e.g., 'movie', 'series').
 *               tomatoes:
 *                 type: object
 *                 description: Rotten Tomatoes information about the movie.
 *               num_mflix_comments:
 *                 type: integer
 *                 description: Number of comments on mflix.
 *     responses:
 *       201:
 *         description: Movie created successfully
 *       400:
 *         description: Bad Request - Missing required fields
 *       500:
 *         description: Internal Server Error
 */
export async function POST(request) {
    try {
        const client = await clientPromise;
        const db = client.db('sample_mflix');
        const body = await request.json();

        // Validate the request body
        if (!body.title || !body.plot || !body.genres || !body.runtime) {
            return NextResponse.json({ status: 400, message: 'Missing required fields' }, { status: 400 });
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
        return NextResponse.json({ status: 201, message: 'Movie created', data: { movieId: result.insertedId } }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ status: 500, message: 'Internal Server Error', error: error.message }, { status: 500 });
    }
}
