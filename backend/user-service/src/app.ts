import express from "express";
import authRouter from "./routes/auth.routes";
import { sessionMiddleware } from "./config/session";
import { trustProxy } from "./config/runtime";
import { sameOrigin } from "./middleware/same-origin";
import { errorHandler } from "./middleware/error-handler";
import { prisma } from "./lib/prisma";

const app = express();
app.disable("x-powered-by");
app.set("trust proxy", trustProxy);
app.use((_req, res, next) => { res.set("X-Content-Type-Options", "nosniff"); next(); });
app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.get("/ready", async (_req, res) => {
    try {
        await prisma.$queryRaw`SELECT "authVersion" FROM "User" LIMIT 0`;
        await prisma.$queryRaw`SELECT "codeSentAt" FROM "PendingRegistration" LIMIT 0`;
        await prisma.$queryRaw`SELECT 1 FROM "PasswordReset", "AuthRateLimit", "user_sessions" LIMIT 0`;
        res.json({ status: "ready" });
    } catch { res.status(503).json({ error: "Database unavailable or migrations missing" }); }
});
app.use(sameOrigin);
app.use(express.json({ limit: "16kb" }));
app.use(sessionMiddleware);
app.use("/auth", authRouter);
app.use((_req, res) => res.status(404).json({ error: "Not found" }));
app.use(errorHandler);
export default app;
