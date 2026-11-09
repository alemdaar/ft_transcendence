import { prisma } from "./prisma";
import type { Prisma } from "../generated/prisma/client";

// All code/password mutations for one email share this transaction-scoped lock.
// SMTP runs inside the transaction so a delivery failure restores the previous code.
export function withAccountLock<T>(email: string, operation: (tx: Prisma.TransactionClient) => Promise<T>) {
    return prisma.$transaction(async tx => {
        await tx.$queryRaw`SELECT 1 FROM pg_advisory_xact_lock(hashtextextended(${email}, 0))`;
        return operation(tx);
    }, { maxWait: 5000, timeout: 30000 });
}
