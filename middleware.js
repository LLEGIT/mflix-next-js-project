import { NextResponse } from 'next/server';
import validateJwt from './app/api/auth/validateJwt';

/**
 * Middleware to check JWT token and refresh it if expired.
 */
export async function middleware(request) {
    // Allow login & refresh-token routes to bypass authentication
    if (request.nextUrl.pathname.startsWith('/api/auth/login') || request.nextUrl.pathname.startsWith('/api/auth/refresh-token')) {
        return NextResponse.next();
    }

    // Extract access token from cookies
    const accessToken = request.cookies.get('accessToken')?.value;
    const refreshToken = request.cookies.get('refreshToken')?.value;

    if (!accessToken) {
        return NextResponse.json({ status: 401, message: 'Unauthorized: Missing access token' }, { status: 401 });
    }

    // Try validating the access token
    const isAccessTokenValid = await validateJwt(accessToken);

    if (isAccessTokenValid) {
        // If the access token is valid, proceed
        return NextResponse.next();
    }

    // If the access token is expired, attempt to refresh using the refresh token
    if (refreshToken) {
        // Call the refresh-token route to get a new access token
        const response = await fetch(`${request.nextUrl.origin}/api/auth/refresh-token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken }), // Pass the refresh token to the backend
        });

        if (response.ok) {
            // If the refresh was successful, get the new access token
            const data = await response.json();
            const newAccessToken = data.accessToken;

            // Set the new access token in the cookies
            const nextResponse = NextResponse.next();
            nextResponse.cookies.set('accessToken', newAccessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 15 * 60, // 15 minutes expiration for access token
            });

            return nextResponse;
        } else {
            return NextResponse.json({ status: 401, message: 'Unauthorized: Invalid or expired refresh token' }, { status: 401 });
        }
    }

    // If no refresh token is available, deny access
    return NextResponse.json({ status: 401, message: 'Unauthorized: Missing refresh token' }, { status: 401 });
}

// Apply this middleware to all API routes, excluding /auth/login & /auth/refresh-token
export const config = {
    matcher: '/api/:path*',
};
