import type { Request, Response } from "express";
import argon2 from "argon2";
import crypto from "node:crypto";


import {
    registerSchema,
    verifyEmailSchema
} from "../schema/auth.schema";

import {
    createPendingRegistration,
    findPendingRegistration,
    deletePendingRegistration,
    deleteExpiredPendingRegistrations,
    findUserByEmail,
    findUserByIntraId,
    createUser
} from "../services/auth.service";

import { sendVerificationEmail } from "../services/email.service";
import { get42UserByLogin } from "../services/fortytwo.service";

export async function register(req: Request, res: Response) {
    const result = registerSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            error: "Invalid registration data",
            details: result.error.issues
        });
    }

    const { email, password } = result.data;

    const existingUser = await findUserByEmail(email);

    if (existingUser) {
        return res.status(409).json({
            error: "User already exists"
        });
    }

    const passwordHash = await argon2.hash(password);

    const code = crypto.randomInt(100000, 1000000).toString();

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await deleteExpiredPendingRegistrations();
    
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

    const pending = await findPendingRegistration(email);

    if (!pending) {
        return res.status(404).json({
            error: "Pending registration not found"
        });
    }

    if (pending.expiresAt < new Date()) {
        await deletePendingRegistration(pending.email);

        return res.status(400).json({
            error: "Verification code expired"
        });
    }

    if (pending.code !== code) {
        return res.status(400).json({
            error: "Invalid verification code"
        });
    }

    const login = email.split("@")[0];

    let profile;

    try {
        profile = await get42UserByLogin(login);
        // console.log("42 CAMPUSES:", profile.campus);
    } catch (error) {
        console.error("42 profile lookup error:", error);

        return res.status(502).json({
            error: "Unable to retrieve 42 profile"
        });
    }

    const existingUser = await findUserByEmail(email);

    if (existingUser) {
        return res.status(409).json({
            error: "User already exists"
        });
    }

    const campus =
        profile.campus?.find(campus => campus.is_primary)?.name
        ?? profile.campus?.[0]?.name
        ?? "1337";

    const user = await createUser({
        email: pending.email,
        passwordHash: pending.passwordHash,
        username: profile.login,
        intraId: profile.id,
        avatarUrl: profile.image?.link,
        campus
    });

    await deletePendingRegistration(email);

    return res.status(201).json({
        message: "Registration completed successfully",
        user: {
            id: user.id,
            email: user.email,
            username: user.username,
            intraId: user.intraId,
            avatarUrl: user.avatarUrl,
            campus: user.campus,
            points: user.points
        }
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

    try {
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

        const profile = await profileResponse.json() as {
            id: number;
            login: string;
            email: string;

            image?: {
                link?: string;
            };

            campus?: {
                id: number;
                name: string;
                time_zone: string;
            }[];

            campus_users?: {
                id: number;
                user_id: number;
                campus_id: number;
                is_primary: boolean;
            }[];
        };

        /*
         * Find which campus is marked as primary.
         *
         * Example:
         * campus_users:
         *   campus_id 16 → is_primary false
         *   campus_id 55 → is_primary true
         *
         * primaryCampusId = 55
         */
        const primaryCampusId =
            profile.campus_users?.find(
                campusUser => campusUser.is_primary
            )?.campus_id;

        /*
         * Use the primary campus ID to find its name.
         *
         * campus id 55 → "Tétouan"
         */
        const campus =
            profile.campus?.find(
                campus => campus.id === primaryCampusId
            )?.name
            ?? profile.campus?.[0]?.name
            ?? "1337";

        const existingUser = await findUserByIntraId(profile.id);

        if (existingUser) {
            return res.status(200).json({
                message: "42 account already registered",
                user: {
                    id: existingUser.id,
                    email: existingUser.email,
                    username: existingUser.username,
                    intraId: existingUser.intraId,
                    avatarUrl: existingUser.avatarUrl,
                    campus: existingUser.campus,
                    points: existingUser.points
                }
            });
        }

        const existingEmail = await findUserByEmail(profile.email);

        if (existingEmail) {
            return res.status(409).json({
                error: "An account with this email already exists"
            });
        }

        const user = await createUser({
            email: profile.email,
            passwordHash: null,
            username: profile.login,
            intraId: profile.id,
            avatarUrl: profile.image?.link,
            campus
        });

        return res.status(201).json({
            message: "Account created successfully with 42",
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                intraId: user.intraId,
                avatarUrl: user.avatarUrl,
                campus: user.campus,
                points: user.points
            }
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            error: "42 authentication failed"
        });
    }
}