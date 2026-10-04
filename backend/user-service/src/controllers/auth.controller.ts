import type { Request, Response } from "express";
import argon2 from "argon2";
import crypto from "node:crypto";

import { registerSchema } from "../schema/auth.schema";
import { createPendingRegistration } from "../services/auth.service";

export async function register(req: Request, res: Response) {
    const result = registerSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            error: "Invalid registration data",
            details: result.error.issues
        });
    }

    const { email, password } = result.data;

    const passwordHash = await argon2.hash(password);

    const code = crypto.randomInt(100000, 1000000).toString();

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await createPendingRegistration({
        email,
        passwordHash,
        code,
        expiresAt
    });

    return res.status(201).json({
        message: "Verification required"
    });
}