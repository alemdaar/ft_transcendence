import express from "express";
import authRouter from "./routes/auth.routes";
import { sessionMiddleware } from "./config/session";
import { trustProxy } from "./config/runtime";
import { sameOrigin } from "./middleware/same-origin";
import { errorHandler } from "./middleware/error-handler";

const app = express();
app.disable("x-powered-by");
app.set("trust proxy", trustProxy);
app.use((_req, res, next) => { res.set("X-Content-Type-Options", "nosniff"); next(); });
app.use(sameOrigin);
app.use(express.json({ limit: "16kb" }));
app.use(sessionMiddleware);
app.use("/auth", authRouter);
app.use((_req, res) => res.status(404).json({ error: "Not found" }));
app.use(errorHandler);
export default app;
