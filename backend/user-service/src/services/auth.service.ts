import { prisma } from "../lib/prisma";

export async function createUser(data: {
    email: string;
    passwordHash: string;
    nickname: string;
    username: string;
    intraId: number;
    campus: string;
}) {
    return prisma.user.create({
        data,
        select: {
            id: true,
            email: true,
            nickname: true,
            username: true,
            intraId: true,
            campus: true,
            avatarUrl: true,
            points: true,
            createdAt: true,
            updatedAt: true
        }
    });
}