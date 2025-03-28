import { GET, POST } from './route';

// Mocking the MongoDB client
jest.mock('@/lib/mongodb', () => ({
    __esModule: true,
    default: Promise.resolve({
        db: () => ({
            collection: () => ({
                find: () => ({
                    limit: () => ({
                        toArray: () =>
                            Promise.resolve([
                                { theaterId: '1', location: { city: 'Paris' } },
                                { theaterId: '2', location: { city: 'Lyon' } },
                            ]),
                    }),
                }),
                insertOne: jest.fn().mockResolvedValue({
                    insertedId: 'mocked_theater_id_456',
                }),
            }),
        }),
    }),
}));

describe('Theaters API', () => {
    describe('GET', () => {
        it('should return theaters with status 200', async () => {
            const response = await GET();
            const body = await response.json();

            expect(response.status).toBe(200);
            expect(body.data).toHaveLength(2);
            expect(body.data[0].theaterId).toBe('1');
        });
    });

    describe('POST', () => {
        it('should create a theater and return status 201', async () => {
            const mockRequest = {
                json: async () => ({
                    theaterId: '789',
                    location: {
                        address: {
                            street1: '1 Rue de Paris',
                            city: 'Paris',
                            state: 'Île-de-France',
                            zipcode: '75000',
                        },
                        geo: {
                            coordinates: [2.3522, 48.8566],
                        },
                    },
                }),
            };

            const response = await POST(mockRequest);
            const body = await response.json();

            expect(response.status).toBe(201);
            expect(body.message).toBe('Theater created');
            expect(body.data.theaterId).toBe('mocked_theater_id_456');
        });

        it('should return 400 if required fields are missing', async () => {
            const mockRequest = {
                json: async () => ({
                    theaterId: '789',
                }), // missing location
            };

            const response = await POST(mockRequest);
            const body = await response.json();

            expect(response.status).toBe(400);
            expect(body.message).toBe('Missing required fields');
        });
    });
});
