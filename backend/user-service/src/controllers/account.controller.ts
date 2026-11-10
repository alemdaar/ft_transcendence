import type { Request, Response } from "express";
import type { User } from "../generated/prisma/client";
import argon2 from "argon2";
import { profileSchema, changePasswordSchema, deleteAccountSchema, emailSchema, resetPasswordSchema } from "../schema/auth.schema";
import { updateProfile, changeUserPassword, deleteUserAccount } from "../services/auth.service";
import { requestPasswordReset, resetUserPassword } from "../services/password-reset.service";
import { HttpError } from "../lib/http-error";
import { destroySession } from "../lib/session";

export async function editProfile(req: Request, res: Response) {
    const result = profileSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: "Invalid profile data", details: result.error.issues });
    return res.json({ user: await updateProfile(res.locals.user as User, result.data) });
}

export async function changePassword(req: Request, res: Response) {
    const result = changePasswordSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: "Invalid password data", details: result.error.issues });
    const user = res.locals.user as User;
    if (!user.passwordHash) throw new HttpError(400, "Use forgot-password to set a password for your 42 account.");
    if (!await argon2.verify(user.passwordHash, result.data.currentPassword)) throw new HttpError(401, "Incorrect current password");
    await changeUserPassword(user, await argon2.hash(result.data.password));
    await destroySession(req, res);
    return res.json({ message: "Password changed. Please sign in again." });
}

export async function forgotPassword(req: Request, res: Response) {
    const result = emailSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: "Invalid email address" });
    await requestPasswordReset(result.data.email);
    return res.json({ message: "If an account exists, password reset instructions will be sent." });
}

export async function resetPassword(req: Request, res: Response) {
    const result = resetPasswordSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: "Invalid password reset data", details: result.error.issues });
    await resetUserPassword(result.data.token, await argon2.hash(result.data.password));
    await destroySession(req, res);
    return res.json({ message: "Password reset. Please sign in again." });
}

export async function deleteAccount(req: Request, res: Response) {
    const result = deleteAccountSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: "Confirm deletion with confirmation: DELETE", details: result.error.issues });
    const user = res.locals.user as User;
    if (user.passwordHash) {
        if (!result.data.currentPassword || !await argon2.verify(user.passwordHash, result.data.currentPassword)) {
            throw new HttpError(401, "Incorrect current password");
        }
    } else if (req.session.authMethod !== "42" || !req.session.authenticatedAt || Date.now() - req.session.authenticatedAt > 600000) {
        throw new HttpError(403, "Sign in with 42 again before deleting your account.");
    }
    await deleteUserAccount(user);
    await destroySession(req, res);
    return res.json({ message: "Account deleted" });
}
