import "dotenv/config";
// dotenv/config automatically loads environment variables from a .env file into process.env.
// This is useful for local development and testing,
// allowing you to define configuration values in a single place without hardcoding them into your application code.
export const frontendUrl = new URL(process.env.FRONTEND_URL ?? "http://localhost:5173/");
// Validate the frontend URL to ensure it is a proper HTTP(S) URL without credentials.
// URL is a built-in class in Node.js that provides a way to parse and manipulate URLs.
if (!["http:", "https:"].includes(frontendUrl.protocol) || frontendUrl.username || frontendUrl.password) {
    throw new Error("FRONTEND_URL must be an HTTP(S) URL without credentials");
}

// Default to direct connections. Set this to the actual proxy addresses in deployment.
export const trustProxy = process.env.TRUST_PROXY?.trim() || false;
// this line checks if the TRUST_PROXY environment variable is set.
// If it is, it trims any whitespace and uses that value; otherwise,
// it defaults to false.
// This setting is important for applications running behind a reverse proxy,
// as it affects how the application interprets client IP addresses and other headers.
export const port = Number(process.env.PORT ?? 3001);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("Invalid PORT");

