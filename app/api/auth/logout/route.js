import { NextResponse } from 'next/server';
import validateJwt from './../validateJwt';

/**
 * @swagger
 * /api/auth/logout:
 *   delete:
 *     tags:
 *       - Auth
 *     summary: Logs out the user by clearing the JWT
 *     description: Removes the JWT stored in cookies
 *     responses:
 *       200:
 *         description: Successfully logged out
 *       500:
 *         description: Internal Server Error
 */
export async function DELETE(request) {
    // Extract token from cookies
    const token = request.cookies.get('accessToken')?.value;

    if (!token) {
        return NextResponse.json({ status: 401, message: 'Unauthorized: Missing token' }, { status: 401 });
    }

    // Validate the token
    const isValid = await validateJwt(token);

    if (!isValid) {
        return NextResponse.json({ status: 401, message: 'Unauthorized: you can\'t log out because you are not logged in or your token is invalid' }, { status: 401 });
    }


    const response = NextResponse.json({ status: 200, message: 'Logged out' });

    // Clear the JWT cookie by setting it to an empty value and expiring it
    response.cookies.set('accessToken', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        expires: new Date(0) // Expire immediately
    });

    // Clear the JWT cookie by setting it to an empty value and expiring it
    response.cookies.set('refreshToken', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        expires: new Date(0) // Expire immediately
    });

    return response;
}
