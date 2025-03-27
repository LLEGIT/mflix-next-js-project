import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

/**
 * @swagger
 * tags:
 *   - name: Movies
 * /api/movies/{idMovie}:
 *   get:
 *     tags:
 *       - Movies
 *     summary: Retrieve a movie by ID
 *     description: Fetch a movie from the database using its ID.
 *     parameters:
 *       - in: path
 *         name: idMovie
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the movie to retrieve.
 *     responses:
 *       200:
 *         description: Movie retrieved successfully
 *       400:
 *         description: Bad Request - Invalid movie ID
 *       404:
 *         description: Movie not found
 *       500:
 *         description: Internal Server Error
 *
 *   put:
 *     tags:
 *       - Movies
 *     summary: Update a movie by ID
 *     description: Update the details of a movie in the database using its ID.
 *     parameters:
 *       - in: path
 *         name: idMovie
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the movie to update.
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
 *       200:
 *         description: Movie updated successfully
 *       400:
 *         description: Bad Request - Invalid movie ID
 *       404:
 *         description: Movie not found
 *       500:
 *         description: Internal Server Error
 *
 *   delete:
 *     tags:
 *       - Movies
 *     summary: Delete a movie by ID
 *     description: Remove a movie from the database using its ID.
 *     parameters:
 *       - in: path
 *         name: idMovie
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the movie to delete.
 *     responses:
 *       200:
 *         description: Movie deleted successfully
 *       400:
 *         description: Bad Request - Invalid movie ID
 *       404:
 *         description: Movie not found
 *       500:
 *         description: Internal Server Error
 */
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
