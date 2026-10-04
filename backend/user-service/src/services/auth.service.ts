import { prisma } from "../lib/prisma";

export async function createPendingRegistration(data: {
    email: string;
    passwordHash: string;
    code: string;
    expiresAt: Date;
}) {
    return prisma.pendingRegistration.create({
        data
    });
}