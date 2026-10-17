import { Router } from "express";

import {
    register,
    verifyEmail,
    resendVerificationCode,
    authorize42,
    callback42,
    login,
    me,
    logout,
    issueAccessToken
} from "../controllers/auth.controller";

import {
    registerRateLimit,
    verifyEmailRateLimit,
    resendCodeRateLimit,
    loginRateLimit
} from "../middleware/auth-rate-limit";

import { requireAuth } from "../middleware/require-auth";

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

authRouter.post(
    "/resend-code",
    resendCodeRateLimit,
    resendVerificationCode
);

authRouter.post(
    "/login",
    loginRateLimit,
    login
);

authRouter.get(
    "/me",
    requireAuth,
    me
);

authRouter.post(
    "/logout",
    requireAuth,
    logout
);

authRouter.post(
    "/token",
    requireAuth,
    issueAccessToken
);

authRouter.get("/42", authorize42);
authRouter.get("/42/callback", callback42);

export default authRouter;