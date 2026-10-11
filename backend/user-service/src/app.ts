import express from "express";
import authRouter from "./routes/auth.routes";

const app = express();

app.set("trust proxy", 1);

app.use(express.json());

app.use("/auth", authRouter);

export default app;