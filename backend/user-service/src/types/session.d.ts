import "express-session";

declare module "express-session" {
    interface SessionData {
        userId?: number;
        authVersion?: number;
        authenticatedAt?: number;
        authMethod?: "password" | "42";

        oauthState?: string;
        oauthStateExpiresAt?: number;
    }
}
