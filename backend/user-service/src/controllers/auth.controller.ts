import type { Request, Response } from "express";
import argon2 from "argon2";
import crypto from "node:crypto";
import { z } from "zod";
import { generateAccessToken } from "../services/jwt.service";


import {
    registerSchema,
    verifyEmailSchema,
    loginSchema
} from "../schema/auth.schema";

import {
    createPendingRegistration,
    findPendingRegistration,
    deletePendingRegistration,
    deleteExpiredPendingRegistrations,
    findUserByEmail,
    findUserByIntraId,
    createUser,
    findUserById
} from "../services/auth.service";

import { sendVerificationEmail } from "../services/email.service";
import {
    get42UserByLogin,
    type FortyTwoUser
} from "../services/fortytwo.service";

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

export async function resendVerificationCode(req: Request, res: Response) {
    const result = z.object({
        email: z.email().endsWith("@student.1337.ma")
    }).safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            error: "Invalid email address"
        });
    }

    const { email } = result.data;
    const pending = await findPendingRegistration(email);
 
    if (!pending) {
        return res.status(200).json({
            message: "If a pending registration exists, a new code will be sent."
        });
    }
    const lastCodeSentAt = pending.expiresAt.getTime() - 5 * 60 * 1000;

    if (Date.now() - lastCodeSentAt < 60 * 1000) {
        return res.status(200).json({
            message: "If a pending registration exists, a new code will be sent."
        });
    }
    const code = crypto.randomInt(100000, 1000000).toString();

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await createPendingRegistration({
        email,
        passwordHash: pending.passwordHash,
        code,
        expiresAt
    });
    await sendVerificationEmail(email, code);
    return res.status(200).json({
        message: "If a pending registration exists, a new code will be sent."
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

    if (pending.expiresAt <= new Date()) {
        return res.status(400).json({
            error: "Verification code expired. Please request a new code."
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

    const primaryCampusId =
        profile.campus_users?.find(
            campusUser => campusUser.is_primary
        )?.campus_id;

    const campus =
        profile.campus?.find(
            campus => campus.id === primaryCampusId
        )?.name
        ?? profile.campus?.[0]?.name
        ?? "1337";

    const user = await createUser({
        email: pending.email,
        passwordHash: pending.passwordHash,
        username: profile.login,
        intraId: profile.id,
        avatarUrl: profile.image?.link,
        campus,
        displayname: profile.displayname,
        location: profile.location
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
            points: user.points,
            displayname: user.displayname,
            location: user.location
        }
    });
}

function saveSession(req: Request): Promise<void> {
    return new Promise((resolve, reject) => {
        req.session.save((error) => {
            if (error) reject(error);
            else resolve();
        });
    });
}

function regenerateSession(req: Request): Promise<void> {
    return new Promise((resolve, reject) => {
        req.session.regenerate((error) => {
            if (error) reject(error);
            else resolve();
        });
    });
}

export async function authorize42(req: Request, res: Response) {
    const clientId = process.env.FORTYTWO_CLIENT_ID;
    const redirectUri = process.env.FORTYTWO_REDIRECT_URI;

    if (!clientId || !redirectUri) {
        return res.status(500).json({
            error: "42 OAuth is not configured"
        });
    }

    const state = crypto.randomBytes(32).toString("hex");

    req.session.oauthState = state;
    req.session.oauthStateExpiresAt = Date.now() + 10 * 60 * 1000;

    await saveSession(req);

    const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: "code",
        state
    });

    return res.redirect(
        `https://api.intra.42.fr/oauth/authorize?${params.toString()}`
    );
}

export async function callback42(req: Request, res: Response) {
    const code = req.query.code;
    const state = req.query.state;

    const expectedState = req.session.oauthState;
    const stateExpiresAt = req.session.oauthStateExpiresAt;

    if (
        typeof state !== "string" ||
        !expectedState ||
        !stateExpiresAt ||
        state !== expectedState ||
        Date.now() >= stateExpiresAt
    ) {
        return res.status(400).json({
            error: "Invalid or expired OAuth state"
        });
    }

    // The OAuth state can only be used once.
    delete req.session.oauthState;
    delete req.session.oauthStateExpiresAt;

    await saveSession(req);

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
        // 1. Exchange the authorization code for an access token.
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

        if (!tokenData.access_token) {
            return res.status(401).json({
                error: "Missing 42 access token"
            });
        }

        // 2. Retrieve the authenticated student's 42 profile.
        const profileResponse = await fetch(
            "https://api.intra.42.fr/v2/me",
            {
                headers: {
                    Authorization: `Bearer ${tokenData.access_token}`
                }
            }
        );

        if (!profileResponse.ok) {
            return res.status(502).json({
                error: "Failed to retrieve 42 profile"
            });
        }

        const profile = await profileResponse.json() as FortyTwoUser;

        if (
            typeof profile.id !== "number" ||
            typeof profile.login !== "string" ||
            typeof profile.email !== "string"
        ) {
            return res.status(502).json({
                error: "Invalid 42 profile data"
            });
        }

        const email = profile.email.toLowerCase();

        // 3. Restrict this platform to 1337 student emails.
        if (!email.endsWith("@student.1337.ma")) {
            return res.status(403).json({
                error: "Only 1337 student accounts are allowed"
            });
        }

        // 4. Find the user by their unique 42 identity.
        let user = await findUserByIntraId(profile.id);

        if (!user) {
            // Reject conflicting identities.
            const existingEmail = await findUserByEmail(email);

            if (existingEmail) {
                return res.status(409).json({
                    error: "This email belongs to another 42 identity"
                });
            }

            // 5. New student: create an account.
            const primaryCampusId =
                profile.campus_users?.find(
                    campusUser => campusUser.is_primary
                )?.campus_id;

            const campus =
                profile.campus?.find(
                    campus => campus.id === primaryCampusId
                )?.name
                ?? profile.campus?.[0]?.name
                ?? "1337";

            user = await createUser({
                email,
                passwordHash: null,
                username: profile.login,
                intraId: profile.id,
                avatarUrl: profile.image?.link,
                campus,
                displayname: profile.displayname,
                location: profile.location
            });
        }

        // 6. Create a fresh authenticated session.
        await regenerateSession(req);

        req.session.userId = user.id;

        await saveSession(req);

        // 7. Return the student to the frontend.
        return res.redirect(302, "/");

    } catch (error) {
        console.error("42 OAuth error:", error);

        return res.status(500).json({
            error: "42 authentication failed"
        });
    }
}

export async function login(req: Request, res: Response) {
    const result = loginSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            error: "Invalid login data"
        });
    }

    const { email, password } = result.data;

    const user = await findUserByEmail(email);

    if (!user || !user.passwordHash) {
        return res.status(401).json({
            error: "Invalid email or password"
        });
    }

    const passwordValid = await argon2.verify(
        user.passwordHash,
        password
    );

    if (!passwordValid) {
        return res.status(401).json({
            error: "Invalid email or password"
        });
    }

    await new Promise<void>((resolve, reject) => {
        req.session.regenerate((error) => {
            if (error) reject(error);
            else resolve();
        });
    });

    req.session.userId = user.id;

    await new Promise<void>((resolve, reject) => {
        req.session.save((error) => {
            if (error) reject(error);
            else resolve();
        });
    });

    return res.status(200).json({
        message: "Login successful",
        user: {
            id: user.id,
            email: user.email,
            username: user.username,
            intraId: user.intraId,
            avatarUrl: user.avatarUrl,
            campus: user.campus,
            points: user.points,
            displayname: user.displayname,
            location: user.location
        }
    });
}

export async function me(req: Request, res: Response) {
    const userId = req.session.userId;

    if (!userId) {
        return res.status(401).json({
            error: "Not authenticated"
        });
    }

    const user = await findUserById(userId);

    if (!user) {
        return res.status(401).json({
            error: "User not found"
        });
    }

    return res.status(200).json({
        user
    });
}

export async function logout(req: Request, res: Response) {
    await new Promise<void>((resolve, reject) => {
        req.session.destroy((error) => {
            if (error) reject(error);
            else resolve();
        });
    });

    res.clearCookie("ft.sid", {
        path: "/"
    });

    return res.status(200).json({
        message: "Logged out successfully"
    });
}

export function issueAccessToken(req: Request, res: Response) {
    const userId = req.session.userId;

    if (!userId) {
        return res.status(401).json({
            error: "Not authenticated"
        });
    }

    const token = generateAccessToken(userId);

    return res.status(200).json({
        accessToken: token,
        tokenType: "Bearer",
        expiresIn: 900
    });
}
