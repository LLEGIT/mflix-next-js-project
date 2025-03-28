import { POST } from './route';

// Mocking the MongoDB client
jest.mock('@/lib/mongodb', () => ({
    __esModule: true,
    default: Promise.resolve({
        db: () => ({
            collection: () => ({
                find: jest.fn().mockImplementation((query) => {
                    if (query.movie_id && query.movie_id.toString() === '000000000000000000000001') {
                        return {
                            limit: jest.fn().mockReturnThis(),
                            toArray: jest.fn().mockResolvedValue([
                                {
                                    _id: '000000000000000000000001',
                                    name: 'John Doe',
                                    movie_id: '000000000000000000000001',
                                    text: 'Great movie!',
                                    date: '2022-12-01T00:00:00Z',
                                },
                            ]),
                        };
                    }
                    return {
                        limit: jest.fn().mockReturnThis(),
                        toArray: jest.fn().mockResolvedValue([]),
                    };
                }),
                insertOne: jest.fn().mockImplementation((comment) => {
                    if (comment.movie_id && comment.text) {
                        return Promise.resolve({
                            insertedId: '000000000000000000000002',
                        });
                    }
                    return Promise.reject('Failed to insert comment');
                }),
            }),
        }),
    }),
}));

describe('Comments API', () => {
    it('should create a new comment and return 201', async () => {
        const mockRequest = {
            json: async () => ({
                name: 'Jane Doe',
                email: 'jane.doe@example.com',
                movie_id: '000000000000000000000001',
                text: 'Amazing film!',
                date: '2022-12-02T00:00:00Z',
            }),
        };

        const response = await POST(mockRequest);
        const body = await response.json();

        expect(response.status).toBe(201);
        expect(body.message).toBe('Comment created');
    });

    it('should return 400 if required fields are missing', async () => {
        const mockRequest = {
            json: async () => ({
                name: 'Jane Doe',
                movie_id: '000000000000000000000001',
                text: 'Amazing film!',
            }),
        };

        const response = await POST(mockRequest);
        const body = await response.json();

        expect(response.status).toBe(400);
        expect(body.message).toBe('Missing required fields');
    });
});
