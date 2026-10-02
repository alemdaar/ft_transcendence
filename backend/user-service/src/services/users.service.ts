import { prisma } from "../lib/prisma";

export async function findUserById(id: number) {
    return prisma.user.findUnique({
        where: {
            id: id
        },
        select: {
            id: true,
            email: true,
            nickname: true,
            username: true,
            intraId: true,
            avatarUrl: true,
            campus: true,
            points: true,
            createdAt: true,
            updatedAt: true
        }
    });
}