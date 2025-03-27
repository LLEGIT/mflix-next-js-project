import { jwtVerify, SignJWT } from 'jose';
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        // Get refresh token from cookies
        const refreshToken = request.cookies.get('refreshToken')?.value;

        if (!refreshToken) {
            return NextResponse.json({ status: 401, message: 'Unauthorized: Missing refresh token' }, { status: 401 });
        }

        // Decode secret key
        const secretKey = new TextEncoder().encode(process.env.JWT_SECRET);

        // Verify refresh token
        const { payload } = await jwtVerify(refreshToken, secretKey);

        if (!payload?.username) {
            return NextResponse.json({ status: 401, message: 'Unauthorized: Invalid refresh token' }, { status: 401 });
        }

        // Generate new access token (valid for 15 minutes)
        const accessToken = await new SignJWT({ username: payload.username })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime('15m')
            .sign(secretKey);

        // Create response and set new access token cookie
        const response = NextResponse.json({ status: 200, accessToken });

        response.cookies.set('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 15 * 60, // 15 minutes
        });

        return response;
    } catch (error) {
        console.error('Refresh token error:', error);
        return NextResponse.json({ status: 401, message: 'Unauthorized: Invalid or expired refresh token' }, { status: 401 });
    }
}
