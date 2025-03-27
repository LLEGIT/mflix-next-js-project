import { NextResponse } from 'next/server';
import validateJwt from './app/api/auth/validateJwt';

export async function middleware(request) {
    // Extract the Authorization header
    const authHeader = request.headers.get('authorization');

    if (!authHeader || authHeader === 'Bearer') {
        return NextResponse.json({ status: 401, message: 'Unauthorized: Missing token' }, { status: 401 });
    }

    // Extract the token from the header
    const token = authHeader.split(' ')[1];

    // Validate the token
    const isValid = await validateJwt(token);

    if (!isValid) {
        return NextResponse.json({ status: 401, message: 'Unauthorized: Invalid token' }, { status: 401 });
    }

    // If the token is valid, proceed to the next middleware or route handler
    return NextResponse.next();
}

// Apply this middleware to all API routes
export const config = {
    matcher: '/api/movies',
};
