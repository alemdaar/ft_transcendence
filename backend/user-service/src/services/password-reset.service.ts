import crypto from "node:crypto";
import { prisma } from "../lib/prisma";
import { withAccountLock } from "../lib/account-transaction";
import { HttpError } from "../lib/http-error";
import { sendPasswordResetEmail } from "./email.service";

const hashToken = (token: string) => crypto.createHash("sha256").update(token).digest("hex");

export async function requestPasswordReset(email: string) {
    return withAccountLock(email, async tx => {
        const user = await tx.user.findUnique({ where: { email } });
        if (!user) return;
        const previous = await tx.passwordReset.findUnique({ where: { userId: user.id } });
        // Keep the same public response for unknown emails and requests in cooldown.
        if (previous && Date.now() - previous.createdAt.getTime() < 60000) return;
        const token = crypto.randomBytes(32).toString("hex");
        const data = { tokenHash: hashToken(token), expiresAt: new Date(Date.now() + 900000), createdAt: new Date() };
        await tx.passwordReset.upsert({ where: { userId: user.id }, create: { userId: user.id, ...data }, update: data });
        await sendPasswordResetEmail(email, token);
    });
}

export async function resetUserPassword(token: string, passwordHash: string) {
    const tokenHash = hashToken(token);
    const reset = await prisma.passwordReset.findUnique({ where: { tokenHash }, include: { user: true } });
    if (!reset) throw new HttpError(400, "Invalid or expired reset token");
    return withAccountLock(reset.user.email, async tx => {
        const consumed = await tx.passwordReset.deleteMany({ where: { tokenHash, expiresAt: { gt: new Date() } } });
        if (consumed.count !== 1) throw new HttpError(400, "Invalid or expired reset token");
        await tx.user.update({ where: { id: reset.userId }, data: { passwordHash, authVersion: { increment: 1 } } });
    });
}
