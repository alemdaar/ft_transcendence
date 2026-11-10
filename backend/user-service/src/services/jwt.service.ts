import "dotenv/config";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET ?? "";
if (JWT_SECRET.length < 32) throw new Error("JWT_SECRET must be at least 32 characters");

export function generateAccessToken(userId: number, authVersion: number, campus: string): string {
    return jwt.sign({ version: authVersion, campus }, JWT_SECRET, {
        algorithm: "HS256", subject: String(userId), issuer: "user-service",
        audience: "ft-transcendence-services", expiresIn: "15m"
    });
}

export function verifyAccessTokenClaims(token: string): { userId: number; authVersion: number; campus: string } {
    const payload = jwt.verify(token, JWT_SECRET, {
        algorithms: ["HS256"], issuer: "user-service", audience: "ft-transcendence-services"
    });
    if (typeof payload === "string" || typeof payload.sub !== "string") throw new Error("Invalid JWT payload");
    const userId = Number(payload.sub);
    if (!Number.isSafeInteger(userId) || userId <= 0 ||
        !Number.isSafeInteger(payload.version) || payload.version < 0 || typeof payload.exp !== "number" ||
        typeof payload.campus !== "string" || payload.campus.trim().length === 0) {
        throw new Error("Invalid JWT payload");
    }
    return { userId, authVersion: payload.version, campus: payload.campus };
}

export function verifyAccessToken(token: string): number {
    return verifyAccessTokenClaims(token).userId;
}
