import { SignJWT } from 'jose';
import { NextResponse } from 'next/server';

export async function POST(request) {
    const body = await request.json();

    if (!body.username || !body.password) {
        return NextResponse.json({ status: 400, message: 'Missing credentials' });
    }

    if (body.username !== process.env.ROOT_USER || body.password !== process.env.ROOT_USER_PASSWORD) {
        return NextResponse.json({ status: 401, message: 'Invalid credentials' });
    }

    // Encodage de la clé secrète
    const secretKey = new TextEncoder().encode(process.env.JWT_SECRET);

    // Génération du token JWT avec `jose`
    const token = await new SignJWT({ username: body.username })
        .setProtectedHeader({ alg: 'HS256' }) // Algorithme de signature
        .setExpirationTime('1h') // Expiration
        .sign(secretKey); // Signature avec la clé secrète

    return NextResponse.json({ status: 200, token });
}
