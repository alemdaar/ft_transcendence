import crypto from "node:crypto";
import type { Request, Response, NextFunction } from "express";
import { rateLimit } from "express-rate-limit";
import { prisma } from "../lib/prisma";
import { studentEmailSchema } from "../schema/auth.schema";
import { HttpError } from "../lib/http-error";

const ipLimit = (limit: number, minutes = 15) => rateLimit({
    windowMs: minutes * 60000, limit, standardHeaders: "draft-8", legacyHeaders: false,
    message: { error: "Too many attempts. Please try again later." }
});

export const registerRateLimit = ipLimit(5);
export const verifyEmailRateLimit = ipLimit(10, 5);
export const resendCodeRateLimit = ipLimit(3);
export const loginRateLimit = ipLimit(10);
export const passwordResetRateLimit = ipLimit(5);
export const sensitiveRateLimit = ipLimit(10);
export const oauthRateLimit = ipLimit(30);

// Atomic PostgreSQL counters apply across IPs, restarts and service instances.
export function accountRateLimit(scope: string, limit: number, minutes: number) {
    return async (req: Request, _res: Response, next: NextFunction) => {
        const email = studentEmailSchema.safeParse(req.body?.email);
        if (!email.success) return next();
        const key = crypto.createHash("sha256").update(`${scope}:${email.data}`).digest("hex");
        const now = new Date();
        const expiresAt = new Date(now.getTime() + minutes * 60000);
        try {
            const [bucket] = await prisma.$queryRaw<{ attempts: number; expiresAt: Date }[]>`
                INSERT INTO "AuthRateLimit" ("key", "attempts", "expiresAt") VALUES (${key}, 1, ${expiresAt})
                ON CONFLICT ("key") DO UPDATE SET
                    "attempts" = CASE WHEN "AuthRateLimit"."expiresAt" <= ${now} THEN 1 ELSE LEAST("AuthRateLimit"."attempts", ${limit}) + 1 END,
                    "expiresAt" = CASE WHEN "AuthRateLimit"."expiresAt" <= ${now} THEN ${expiresAt} ELSE "AuthRateLimit"."expiresAt" END
                RETURNING "attempts", "expiresAt"`;
            if (bucket!.attempts > limit) {
                throw new HttpError(429, "Too many attempts for this account. Please try again later.",
                    Math.max(1, Math.ceil((bucket!.expiresAt.getTime() - now.getTime()) / 1000)));
            }
            next();
        } catch (error) { next(error); }
    };
}
