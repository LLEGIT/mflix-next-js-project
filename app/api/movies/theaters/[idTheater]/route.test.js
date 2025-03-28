import { GET, PUT, DELETE } from './route';

// Mocking the MongoDB client
jest.mock('@/lib/mongodb', () => ({
    __esModule: true,
    default: Promise.resolve({
        db: () => ({
            collection: () => ({
                findOne: jest.fn().mockImplementation(({ _id }) => {
                    if (_id.toString() === '000000000000000000000001') {
                        return Promise.resolve({
                            _id,
                            location: {
                                address: { street1: '123 Main St', city: 'NYC', state: 'NY', zipcode: '10001' },
                                geo: { type: 'Point', coordinates: [-73.935242, 40.73061] },
                            },
                        });
                    }
                    return Promise.resolve(null);
                }),
                updateOne: jest.fn().mockImplementation(({ theaterId }) => {
                    return Promise.resolve({
                        matchedCount: theaterId === 123 ? 1 : 0,
                    });
                }),
                deleteOne: jest.fn().mockImplementation(({ idTheater }) => {
                    return Promise.resolve({
                        deletedCount: idTheater === 123 ? 1 : 0,
                    });
                }),
            }),
        }),
    }),
}));

describe('Theaters API', () => {
    describe('GET', () => {
        it('should return a theater with status 200', async () => {
            const response = await GET(null, { params: { idTheater: '000000000000000000000001' } });
            const body = await response.json();

            expect(response.status).toBe(200);
            expect(body.data.theater.location.address.city).toBe('NYC');
        });

        it('should return 400 if id is invalid', async () => {
            const response = await GET(null, { params: { idTheater: 'invalid-id' } });
            const body = await response.json();

            expect(response.status).toBe(400);
            expect(body.message).toBe('Invalid theater ID');
        });

        it('should return 404 if theater not found', async () => {
            const response = await GET(null, { params: { idTheater: '000000000000000000000099' } });
            const body = await response.json();

            expect(response.status).toBe(404);
            expect(body.message).toBe('Theater not found');
        });
    });

    describe('PUT', () => {
        it('should update a theater and return 200', async () => {
            const mockRequest = {
                json: async () => ({
                    location: {
                        address: {
                            street1: '456 Broadway',
                            city: 'Brooklyn',
                            state: 'NY',
                            zipcode: '11211',
                        },
                        geo: {
                            coordinates: [-73.9442, 40.6782],
                        },
                    },
                }),
            };

            const response = await PUT(mockRequest, { params: { theaterId: '123' } });
            const body = await response.json();

            expect(response.status).toBe(200);
            expect(body.message).toBe('Theater updated');
        });

        it('should return 400 if ID is invalid', async () => {
            const mockRequest = {
                json: async () => ({}),
            };

            const response = await PUT(mockRequest, { params: { theaterId: 'invalid' } });
            const body = await response.json();

            expect(response.status).toBe(400);
            expect(body.message).toBe('Invalid theater ID');
        });

        it('should return 404 if no theater found to update', async () => {
            const mockRequest = {
                json: async () => ({
                    location: {
                        address: {
                            street1: 'Somewhere',
                            city: 'Nowhere',
                            state: 'NA',
                            zipcode: '00000',
                        },
                        geo: {
                            coordinates: [0, 0],
                        },
                    },
                }),
            };

            const response = await PUT(mockRequest, { params: { theaterId: '999' } });
            const body = await response.json();

            expect(response.status).toBe(404);
            expect(body.message).toBe('Theater not found');
        });
    });

    describe('DELETE', () => {
        it('should delete a theater and return 200', async () => {
            const response = await DELETE(null, { params: { idTheater: '123' } });
            const body = await response.json();

            expect(response.status).toBe(200);
            expect(body.message).toBe('Theater deleted');
        });

        it('should return 400 if ID is invalid', async () => {
            const response = await DELETE(null, { params: { idTheater: 'invalid' } });
            const body = await response.json();

            expect(response.status).toBe(400);
            expect(body.message).toBe('Invalid theater ID');
        });

        it('should return 404 if no theater found to delete', async () => {
            const response = await DELETE(null, { params: { idTheater: '999' } });
            const body = await response.json();

            expect(response.status).toBe(404);
            expect(body.message).toBe('Theater not found');
        });
    });
});
