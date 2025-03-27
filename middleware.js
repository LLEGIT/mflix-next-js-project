import { NextResponse } from 'next/server';
import validateJwt from './app/api/auth/validateJwt';

export async function middleware(request) {
    // Allow login & refresh-token routes to bypass authentication
    if (request.nextUrl.pathname.startsWith('/api/auth/login') || request.nextUrl.pathname.startsWith('/api/auth/refresh-token')) {
        return NextResponse.next();
    }

    // Extract token from cookies
    const token = request.cookies.get('accessToken')?.value;

    if (!token) {
        return NextResponse.json({ status: 401, message: 'Unauthorized: Missing token' }, { status: 401 });
    }

    // Validate the token
    const isValid = await validateJwt(token);

    if (!isValid) {
        return NextResponse.json({ status: 401, message: 'Unauthorized: Invalid token' }, { status: 401 });
    }

    // If token is valid, proceed
    return NextResponse.next();
}

// Apply this middleware to all API routes, excluding /auth/login & /auth/refresh-token
export const config = {
    matcher: '/api/:path*',
};
