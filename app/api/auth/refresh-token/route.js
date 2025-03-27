import { jwtVerify } from 'jose';

/**
 * Validates the JWT stored in cookies.
 * @param {Request} request - The incoming request object.
 * @returns {Promise<boolean>} - Returns true if the token is valid, otherwise false.
 */
export default async function validateJwt(request) {
    try {
        // Get the access token from cookies
        const accessToken = request.cookies.get('accessToken')?.value;

        if (!accessToken) {
            console.log('No access token found in cookies');
            return false;
        }

        // Decode secret key
        const secretKey = new TextEncoder().encode(process.env.JWT_SECRET);

        // Verify JWT
        const { payload } = await jwtVerify(accessToken, secretKey);

        // If valid, return true
        return !!payload;
    } catch (error) {
        console.error('JWT validation error:', error.message);
        return false;
    }
}
