import { prisma } from "../lib/prisma";

export async function cleanupAuthData() {
    const now = new Date();
    await Promise.all([
        prisma.authRateLimit.deleteMany({ where: { expiresAt: { lt: now } } }),
        prisma.passwordReset.deleteMany({ where: { expiresAt: { lt: now } } }),
        prisma.pendingRegistration.deleteMany({ where: { expiresAt: { lt: new Date(now.getTime() - 86400000) } } })
    ]);
}
