import { SignJWT } from 'jose';
import { NextResponse } from 'next/server';

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Authenticate user and generate tokens to store in cookies
 *     description: Returns an access token and a refresh token, both stored in HTTP-only cookies
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: The username for authentication.
 *               password:
 *                 type: string
 *                 description: The password for authentication.
 *             required:
 *               - username
 *               - password
 *     responses:
 *       200:
 *         description: Authentication successful, returns access and refresh tokens in cookies
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   description: Status code of the response
 *                 message:
 *                   type: string
 *                   description: Description of the response
 *       400:
 *         description: Missing or invalid credentials
 *       401:
 *         description: Invalid username or password
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

        // Encode secret key
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
        const response = NextResponse.json({ status: 200, message: 'Login successful' });

        // Store tokens in secure HTTP-only cookies
        response.cookies.set('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 15 * 60, // 15 minutes
        });

        response.cookies.set('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60, // 7 days
        });

        return response;
    } catch (error) {
        if (error.message === 'Unexpected end of JSON input') {
            return NextResponse.json({ status: 400, message: 'Incorrect body provided' }, { status: 400 });
        }

        return NextResponse.json({ status: 500, message: 'Internal Server Error' }, { status: 500 });
    }
}
