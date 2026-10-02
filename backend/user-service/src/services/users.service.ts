import { prisma } from "../lib/prisma";

export async function findUserById(id: number) {
    return prisma.user.findUnique({
        where: {
            id: id
        }
    });
}