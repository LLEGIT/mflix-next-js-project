import { SignJWT } from 'jose';
import { NextResponse } from 'next/server';

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Authenticate user and generate tokens
 *     description: Returns an access token in the response and a refresh token in an HTTP-only cookie
 *     responses:
 *       200:
 *         description: Authentication successful
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Internal Server Error
 */
export async function POST(request) {
    try {
        const body = await request.json();

        if (!body.username || !body.password) {
            return NextResponse.json({ status: 400, message: 'Missing credentials' }, { status: 400 });
        }

        if (body.username !== process.env.ROOT_USER || body.password !== process.env.ROOT_USER_PASSWORD) {
            return NextResponse.json({ status: 401, message: 'Invalid credentials' }, { status: 401 });
        }

        // Secret key encoding
        const secretKey = new TextEncoder().encode(process.env.JWT_SECRET);

        // Generate Access Token (short-lived)
        const accessToken = await new SignJWT({ username: body.username })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime('15m') // 15 minutes expiry
            .sign(secretKey);

        // Generate Refresh Token (longer-lived)
        const refreshToken = await new SignJWT({ username: body.username })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime('7d') // 7 days expiry
            .sign(secretKey);

        // Create response object
        const response = NextResponse.json({ status: 200, accessToken });

        // Store refresh token in a secure HTTP-only cookie
        response.cookies.set('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60, // 7 days
        });

        return response;
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ status: 500, message: 'Internal Server Error' }, { status: 500 });
    }
}
