import { Router } from "express";

import {
    register,
    verifyEmail,
    authorize42,
    callback42
} from "../controllers/auth.controller";

import {
    registerRateLimit,
    verifyEmailRateLimit
} from "../middleware/auth-rate-limit";

const authRouter = Router();

authRouter.post(
    "/register",
    registerRateLimit,
    register
);

authRouter.post(
    "/verify-email",
    verifyEmailRateLimit,
    verifyEmail
);

authRouter.get("/42", authorize42);
authRouter.get("/42/callback", callback42);

export default authRouter;