import express from "express";
import usersRouter from "./routes/users.routes";
import authRouter from "./routes/auth.routes";

const app = express();

app.use(express.json());

app.use("/users", usersRouter);
app.use("/auth", authRouter);

export default app;