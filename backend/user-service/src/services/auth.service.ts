import { prisma } from "../lib/prisma";

export async function createPendingRegistration(data: {
    email: string;
    passwordHash: string;
    code: string;
    expiresAt: Date;
}) {
    return prisma.pendingRegistration.upsert({
        where: {
            email: data.email
        },
        update: {
            passwordHash: data.passwordHash,
            code: data.code,
            expiresAt: data.expiresAt
        },
        create: data
    });
}

export async function findPendingRegistration(email: string) {
    return prisma.pendingRegistration.findUnique({
        where: {
            email
        }
    });
}