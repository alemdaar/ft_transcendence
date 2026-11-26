import { prisma } from "../lib/prisma";

export function findUsersByIds(ids: number[]) {
    return prisma.user.findMany({
        where: { id: { in: ids } },
        select: { id: true, username: true, avatarUrl: true }
    });
}
