import { GET, POST } from './route';

// Mocking the MongoDB client
jest.mock('@/lib/mongodb', () => ({
    __esModule: true,
    default: Promise.resolve({
        db: () => ({
            collection: () => ({
                find: () => ({
                    limit: () => ({
                        toArray: () => Promise.resolve([
                            { title: 'Movie 1', runtime: 120 },
                            { title: 'Movie 2', runtime: 90 },
                        ]),
                    }),
                }),
                insertOne: jest.fn().mockResolvedValue({
                    insertedId: 'mocked_id_123',
                }),
            }),
        }),
    }),
}));

describe('Movies API', () => {
    describe('GET', () => {
        it('should return movies with status 200', async () => {
            const response = await GET();
            const body = await response.json();

            expect(response.status).toBe(200);
            expect(body.data).toHaveLength(2);
            expect(body.data[0].title).toBe('Movie 1');
        });
    });

    describe('POST', () => {
        it('should create a movie and return status 201', async () => {
            const mockRequest = {
                json: async () => ({
                    title: 'New Movie',
                    plot: 'A cool plot',
                    genres: ['Drama'],
                    runtime: 120,
                }),
            };


            const response = await POST(mockRequest);
            const body = await response.json();

            expect(response.status).toBe(201);
            expect(body.message).toBe('Movie created');
            expect(body.data.movieId).toBe('mocked_id_123');
        });

        it('should return 400 if required fields are missing', async () => {
            const mockRequest = {
                json: async () => ({
                    title: 'Missing stuff',
                    genres: ['Comedy'],
                }),
            };

            const response = await POST(mockRequest);
            const body = await response.json();

            expect(response.status).toBe(400);
            expect(body.message).toBe('Missing required fields');
        });
    });
});
