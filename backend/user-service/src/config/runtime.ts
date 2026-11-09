import "dotenv/config";

export const frontendUrl = new URL(process.env.FRONTEND_URL ?? "http://localhost:5173/");
if (!["http:", "https:"].includes(frontendUrl.protocol) || frontendUrl.username || frontendUrl.password) {
    throw new Error("FRONTEND_URL must be an HTTP(S) URL without credentials");
}

// Default to direct connections. Set this to the actual proxy addresses in deployment.
export const trustProxy = process.env.TRUST_PROXY?.trim() || false;
export const port = Number(process.env.PORT ?? 3001);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("Invalid PORT");
