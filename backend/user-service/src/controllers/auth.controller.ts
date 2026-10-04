import type { Request, Response } from "express";
import argon2 from "argon2";
import crypto from "node:crypto";

import {
    registerSchema,
    verifyEmailSchema
} from "../schema/auth.schema";

import {
    createPendingRegistration,
    findPendingRegistration
} from "../services/auth.service";

import { sendVerificationEmail } from "../services/email.service";

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

    await sendVerificationEmail(email, code);

    return res.status(201).json({
        message: "Verification required"
    });
}

export async function verifyEmail(req: Request, res: Response) {
    const result = verifyEmailSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            error: "Invalid verification data",
            details: result.error.issues
        });
    }

    const { email, code } = result.data;

    const pendingRegistration = await findPendingRegistration(email);

    if (!pendingRegistration) {
        return res.status(404).json({
            error: "Pending registration not found"
        });
    }

    if (pendingRegistration.expiresAt < new Date()) {
        return res.status(400).json({
            error: "Verification code has expired"
        });
    }

    if (pendingRegistration.code !== code) {
        return res.status(400).json({
            error: "Invalid verification code"
        });
    }

    return res.status(200).json({
        message: "Email verified successfully"
    });
}

export function authorize42(req: Request, res: Response) {
    const clientId = process.env.FORTYTWO_CLIENT_ID;
    const redirectUri = process.env.FORTYTWO_REDIRECT_URI;

    if (!clientId || !redirectUri) {
        return res.status(500).json({
            error: "42 OAuth is not configured"
        });
    }

    const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: "code"
    });

    return res.redirect(
        `https://api.intra.42.fr/oauth/authorize?${params.toString()}`
    );
}

export async function callback42(req: Request, res: Response) {
    const code = req.query.code;

    if (typeof code !== "string") {
        return res.status(400).json({
            error: "Missing authorization code"
        });
    }

    const clientId = process.env.FORTYTWO_CLIENT_ID;
    const clientSecret = process.env.FORTYTWO_CLIENT_SECRET;
    const redirectUri = process.env.FORTYTWO_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
        return res.status(500).json({
            error: "42 OAuth is not configured"
        });
    }

    const tokenResponse = await fetch(
        "https://api.intra.42.fr/oauth/token",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                grant_type: "authorization_code",
                client_id: clientId,
                client_secret: clientSecret,
                code,
                redirect_uri: redirectUri
            })
        }
    );

    if (!tokenResponse.ok) {
        return res.status(401).json({
            error: "Failed to authenticate with 42"
        });
    }

    const tokenData = await tokenResponse.json() as {
        access_token: string;
    };

    const profileResponse = await fetch(
        "https://api.intra.42.fr/v2/me",
        {
            headers: {
                Authorization: `Bearer ${tokenData.access_token}`
            }
        }
    );

    if (!profileResponse.ok) {
        return res.status(401).json({
            error: "Failed to retrieve 42 profile"
        });
    }

    const profile = await profileResponse.json();

    return res.status(200).json({
        message: "42 authentication successful",
        profile
    });
}

