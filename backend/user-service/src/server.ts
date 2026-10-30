import "dotenv/config";
import app from "./app";
import { port } from "./config/runtime";
import { prisma } from "./lib/prisma";
import { sessionStore } from "./config/session";
import { cleanupAuthData } from "./services/cleanup.service";

const server = app.listen(port, () => console.log(`User service running on port ${port}`));
const cleanup = setInterval(() => {
    cleanupAuthData().catch(() => console.error("Authentication cleanup failed"));
}, 5 * 60 * 1000);
cleanup.unref();
for (const signal of ["SIGTERM", "SIGINT"] as const) {
    process.once(signal, () => {
        clearInterval(cleanup);
        server.close(async () => {
            await sessionStore.close();
            await prisma.$disconnect();
            process.exit(0);
        });
        setTimeout(() => process.exit(1), 10000).unref();
    });
}
