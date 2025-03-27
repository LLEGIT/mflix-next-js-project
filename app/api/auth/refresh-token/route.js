import { SignJWT, jwtVerify } from 'jose';
import { NextResponse } from 'next/server';

/**
 * @swagger
 * /api/auth/refresh-token:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Refreshes the access token using a valid refresh token
 *     description: Returns a new JWT access token if the refresh token is valid
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *       401:
 *         description: Unauthorized (invalid or expired refresh token)
 *       500:
 *         description: Internal Server Error
 */
export async function POST(request) {
    try {
        // Get refresh token from cookies
        const refreshToken = request.cookies.get('refreshToken')?.value;

        if (!refreshToken) {
            return NextResponse.json({ status: 401, message: 'Unauthorized: No refresh token provided' }, { status: 401 });
        }

        // Decode secret key
        const secretKey = new TextEncoder().encode(process.env.JWT_SECRET);

        // Verify refresh token
        let payload;
        try {
            const { payload: decodedPayload } = await jwtVerify(refreshToken, secretKey);
            payload = decodedPayload;
        } catch (error) {
            return NextResponse.json({ status: 401, message: 'Unauthorized: Invalid or expired refresh token' }, { status: 401 });
        }

        // Generate new access token
        const accessToken = await new SignJWT({ username: payload.username })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime('15m') // Shorter expiry time for security
            .sign(secretKey);

        return NextResponse.json({ status: 200, accessToken });
    } catch (error) {
        console.error('Error refreshing token:', error);
        return NextResponse.json({ status: 500, message: 'Internal Server Error' }, { status: 500 });
    }
}
