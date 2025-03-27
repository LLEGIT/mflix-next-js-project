import { jwtVerify } from 'jose';

export default async function validateJwt(token) {
    try {
        if (!token) {
            throw new Error("Token manquant");
        }

        const secretKey = new TextEncoder().encode(process.env.JWT_SECRET);

        const { payload } = await jwtVerify(token, secretKey);

        return payload; // Renvoie les données décodées si le token est valide
    } catch (error) {
        console.error("Erreur de validation du JWT :", error.message);
        return false;
    }
}
