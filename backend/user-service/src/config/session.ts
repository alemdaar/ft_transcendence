import "dotenv/config";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";

const PgSession = connectPgSimple(session);

const sessionSecret = process.env.SESSION_SECRET;
const databaseUrl = process.env.DATABASE_URL;

if (!sessionSecret || sessionSecret.length < 32) {
    throw new Error("SESSION_SECRET must be at least 32 characters");
}

if (!databaseUrl) {
    throw new Error("DATABASE_URL is not configured");
}

export const sessionMiddleware = session({
    name: "ft.sid",

    secret: sessionSecret,

    store: new PgSession({
        conString: databaseUrl,
        tableName: "user_sessions",
        createTableIfMissing: true
    }),

    resave: false,
    saveUninitialized: false,
    rolling: true,

    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000
    }
});