import express from "express";
import type { Request, Response, NextFunction } from "express";
import authRouter from "./routes/auth.routes";
import { sessionMiddleware } from "./config/session";

const app = express();

app.set("trust proxy", 1);

app.use(express.json());

app.use(sessionMiddleware);

app.use("/auth", authRouter);

app.use((
    error: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction
) => {
    console.error("Backend error:", error);

    return res.status(500).json({
        error: "Internal server error"
    });
});

export default app;