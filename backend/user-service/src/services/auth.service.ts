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

export async function deletePendingRegistration(email: string) {
    return prisma.pendingRegistration.delete({
        where: {
            email
        }
    });
}

export async function findUserByEmail(email: string) {
    return prisma.user.findUnique({
        where: {
            email
        }
    });
}

export async function findUserByIntraId(intraId: number) {
    return prisma.user.findUnique({
        where: {
            intraId
        }
    });
}

export async function createUser(data: {
    email: string;
    passwordHash?: string | null;
    username: string;
    intraId: number;
    avatarUrl?: string;
    campus: string;
}) {
    return prisma.user.create({
        data: {
            email: data.email,
            passwordHash: data.passwordHash ?? null,
            username: data.username,
            intraId: data.intraId,
            avatarUrl: data.avatarUrl,
            campus: data.campus
        }
    });
}
export async function deleteExpiredPendingRegistrations() {
    return prisma.pendingRegistration.deleteMany({
        where: {
            expiresAt: {
                lt: new Date()
            }
        }
    });
}