import type { Request, Response } from "express";
import argon2 from "argon2";
import crypto from "node:crypto";
import { generateAccessToken } from "../services/jwt.service";
import { registerSchema, verifyEmailSchema, loginSchema, emailSchema } from "../schema/auth.schema";
import {
    deliverRegistrationCode, findPendingRegistration, completeRegistration,
    findUserByEmail, findOrCreate42User, publicUser
} from "../services/auth.service";
import { get42UserByLogin, fetch42, parse42Profile, read42Json } from "../services/fortytwo.service";
import { HttpError } from "../lib/http-error";
import { saveSession, signIn, destroySession } from "../lib/session";
import { frontendUrl } from "../config/runtime";
import type { User } from "../generated/prisma/client";

export async function register(req: Request, res: Response) {
    const result = registerSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: "Invalid registration data", details: result.error.issues });
    const { email, password } = result.data;
    await deliverRegistrationCode(email, await argon2.hash(password));
    return res.status(201).json({ message: "Verification required" });
}

export async function resendVerificationCode(req: Request, res: Response) {
    const result = emailSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: "Invalid email address" });
    await deliverRegistrationCode(result.data.email);
    return res.status(200).json({ message: "If a pending registration exists, a new code will be sent." });
}

export async function verifyEmail(req: Request, res: Response) {
    const result = verifyEmailSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: "Invalid verification data", details: result.error.issues });
    const { email, code } = result.data;
    const pending = await findPendingRegistration(email);
    if (!pending) throw new HttpError(404, "Pending registration not found");
    if (pending.expiresAt <= new Date()) throw new HttpError(400, "Verification code expired. Please request a new code.");
    if (pending.code !== code) throw new HttpError(400, "Invalid verification code");
    const profile = await get42UserByLogin(email.split("@")[0]!);
    const user = await completeRegistration(pending, profile);
    return res.status(201).json({ message: "Registration completed successfully", user: publicUser(user) });
}

export async function authorize42(req: Request, res: Response) {
    const clientId = process.env.FORTYTWO_CLIENT_ID;
    const redirectUri = process.env.FORTYTWO_REDIRECT_URI;
    if (!clientId || !redirectUri) throw new HttpError(503, "42 OAuth is not configured");
    const state = crypto.randomBytes(32).toString("hex");
    req.session.oauthState = state;
    req.session.oauthStateExpiresAt = Date.now() + 600000;
    await saveSession(req);
    const params = new URLSearchParams({ client_id: clientId, redirect_uri: redirectUri, response_type: "code", state });
    return res.redirect(`https://api.intra.42.fr/oauth/authorize?${params.toString()}`);
}

export async function callback42(req: Request, res: Response) {
    const { code, state } = req.query;
    const expectedState = req.session.oauthState;
    const stateExpiresAt = req.session.oauthStateExpiresAt;
    if (typeof state !== "string" || !expectedState || !stateExpiresAt || state !== expectedState || Date.now() >= stateExpiresAt) {
        throw new HttpError(400, "Invalid or expired OAuth state");
    }
    delete req.session.oauthState;
    delete req.session.oauthStateExpiresAt;
    await saveSession(req);
    if (typeof code !== "string" || !code) throw new HttpError(400, "Missing authorization code");
    const clientId = process.env.FORTYTWO_CLIENT_ID;
    const clientSecret = process.env.FORTYTWO_CLIENT_SECRET;
    const redirectUri = process.env.FORTYTWO_REDIRECT_URI;
    if (!clientId || !clientSecret || !redirectUri) throw new HttpError(503, "42 OAuth is not configured");
    const tokenResponse = await fetch42("/oauth/token", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ grant_type: "authorization_code", client_id: clientId, client_secret: clientSecret, code, redirect_uri: redirectUri })
    });
    if (!tokenResponse.ok) throw new HttpError(401, "Failed to authenticate with 42");
    const tokenData = await read42Json(tokenResponse) as { access_token?: unknown } | null;
    if (typeof tokenData?.access_token !== "string" || !tokenData.access_token) throw new HttpError(502, "Invalid 42 access token");
    const profileResponse = await fetch42("/v2/me", { headers: { Authorization: `Bearer ${tokenData.access_token}` } });
    if (!profileResponse.ok) throw new HttpError(502, "Failed to retrieve 42 profile");
    const profile = parse42Profile(await read42Json(profileResponse));
    if (!profile.email.toLowerCase().endsWith("@student.1337.ma")) throw new HttpError(403, "Only 1337 student accounts are allowed");
    const user = await findOrCreate42User(profile);
    await signIn(req, user, "42");
    return res.redirect(302, frontendUrl.href);
}

export async function login(req: Request, res: Response) {
    const result = loginSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: "Invalid login data" });
    const user = await findUserByEmail(result.data.email);
    if (!user?.passwordHash || !await argon2.verify(user.passwordHash, result.data.password)) {
        throw new HttpError(401, "Invalid email or password");
    }
    await signIn(req, user, "password");
    return res.status(200).json({ message: "Login successful", user: publicUser(user) });
}

export function me(_req: Request, res: Response) {
    return res.status(200).json({ user: publicUser(res.locals.user as User) });
}

export async function logout(req: Request, res: Response) {
    await destroySession(req, res);
    return res.status(200).json({ message: "Logged out successfully" });
}

export function issueAccessToken(_req: Request, res: Response) {
    const user = res.locals.user as User;
    return res.status(200).json({ accessToken: generateAccessToken(user.id, user.authVersion, user.campus), tokenType: "Bearer", expiresIn: 900 });
}
