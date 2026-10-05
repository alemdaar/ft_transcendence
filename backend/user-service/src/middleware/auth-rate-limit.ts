import { rateLimit } from "express-rate-limit";

export const registerRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        error: "Too many registration attempts. Please try again later."
    }
});

export const verifyEmailRateLimit = rateLimit({
    windowMs: 5 * 60 * 1000,
    limit: 10,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        error: "Too many verification attempts. Please try again later."
    }
});