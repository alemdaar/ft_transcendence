import crypto from "node:crypto";
import { prisma } from "../lib/prisma";
import { withAccountLock } from "../lib/account-transaction";
import { HttpError } from "../lib/http-error";
import { sendVerificationEmail } from "./email.service";
import type { PendingRegistration, User } from "../generated/prisma/client";
import type { FortyTwoUser } from "./fortytwo.service";

export const publicUserSelect = {
    id: true, email: true, username: true, intraId: true, avatarUrl: true,
    campus: true, points: true, displayname: true, location: true
} as const;

export function publicUser(user: User) {
    const { id, email, username, intraId, avatarUrl, campus, points, displayname, location } = user;
    return { id, email, username, intraId, avatarUrl, campus, points, displayname, location };
}

function checkCooldown(pending: PendingRegistration) {
    const retryAfter = Math.ceil((pending.codeSentAt.getTime() + 60000 - Date.now()) / 1000);
    if (retryAfter > 0) throw new HttpError(429, "Please wait before requesting another code.", retryAfter);
}

export async function deliverRegistrationCode(email: string, passwordHash?: string) {
    return withAccountLock(email, async tx => {
        if (await tx.user.findUnique({ where: { email } })) {
            if (passwordHash) throw new HttpError(409, "User already exists");
            return;
        }
        const pending = await tx.pendingRegistration.findUnique({ where: { email } });
        if (!pending && !passwordHash) return;
        if (pending) {
            checkCooldown(pending);
            // Preserve the password associated with an active registration's code.
            if (passwordHash && pending.expiresAt > new Date()) {
                throw new HttpError(409, "Registration pending. Verify your email or request a new code.");
            }
        }
        const code = crypto.randomInt(100000, 1000000).toString();
        const codeSentAt = new Date();
        const data = {
            passwordHash: passwordHash ?? pending!.passwordHash,
            code, codeSentAt, expiresAt: new Date(codeSentAt.getTime() + 300000)
        };
        await tx.pendingRegistration.upsert({ where: { email }, create: { email, ...data }, update: data });
        await sendVerificationEmail(email, code);
    });
}

export const findPendingRegistration = (email: string) => prisma.pendingRegistration.findUnique({ where: { email } });
export const findUserByEmail = (email: string) => prisma.user.findUnique({ where: { email } });
export const findUserById = (id: number) => prisma.user.findUnique({ where: { id } });

function profileData(profile: FortyTwoUser) {
    const primaryCampusId = profile.campus_users?.find(c => c.is_primary)?.campus_id;
    return {
        username: profile.login, intraId: profile.id, avatarUrl: profile.image?.link,
        campus: profile.campus?.find(c => c.id === primaryCampusId)?.name ?? profile.campus?.[0]?.name ?? "1337",
        displayname: profile.displayname, location: profile.location
    };
}

export async function completeRegistration(pending: PendingRegistration, profile: FortyTwoUser) {
    return withAccountLock(pending.email, async tx => {
        // Recheck the exact code and password AFTER the external profile lookup.
        const consumed = await tx.pendingRegistration.deleteMany({ where: {
            id: pending.id, email: pending.email, code: pending.code,
            passwordHash: pending.passwordHash, expiresAt: { equals: pending.expiresAt, gt: new Date() }
        } });
        if (consumed.count !== 1) throw new HttpError(400, "Verification code changed or expired. Please try again.");
        return tx.user.create({ data: {
            email: pending.email, passwordHash: pending.passwordHash, ...profileData(profile)
        } });
    });
}

export async function findOrCreate42User(profile: FortyTwoUser) {
    const email = profile.email.toLowerCase();
    return withAccountLock(email, async tx => {
        let user = await tx.user.findUnique({ where: { intraId: profile.id } });
        if (!user) {
            if (await tx.user.findUnique({ where: { email } })) {
                throw new HttpError(409, "This email belongs to another 42 identity");
            }
            user = await tx.user.create({ data: { email, passwordHash: null, ...profileData(profile) } });
        }
        await tx.pendingRegistration.deleteMany({ where: { email } });
        return user;
    });
}

export async function updateProfile(user: User, data: { displayname?: string; location?: string | null; avatarUrl?: string | null }) {
    return prisma.user.update({ where: { id: user.id, authVersion: user.authVersion }, data, select: publicUserSelect });
}

export async function changeUserPassword(user: User, passwordHash: string) {
    return withAccountLock(user.email, async tx => {
        const updated = await tx.user.updateMany({
            where: { id: user.id, authVersion: user.authVersion },
            data: { passwordHash, authVersion: { increment: 1 } }
        });
        if (updated.count !== 1) throw new HttpError(401, "Account changed. Please sign in again.");
        await tx.passwordReset.deleteMany({ where: { userId: user.id } });
    });
}

export async function deleteUserAccount(user: User) {
    return withAccountLock(user.email, async tx => {
        const removed = await tx.user.deleteMany({ where: { id: user.id, authVersion: user.authVersion } });
        if (removed.count !== 1) throw new HttpError(401, "Account changed. Please sign in again.");
        await tx.pendingRegistration.deleteMany({ where: { email: user.email } });
        await tx.$executeRaw`DELETE FROM "user_sessions" WHERE "sess"->>'userId' = ${String(user.id)}`;
    });
}
