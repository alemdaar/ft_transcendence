import "dotenv/config";
import app from "./app";
import { port } from "./config/runtime";
import { cleanupAuthData } from "./services/cleanup.service";

app.listen(port, () => {
    console.log(`User service running on port ${port}`);
});

setInterval(() => {
    cleanupAuthData().catch(error => {
        console.error("Authentication cleanup failed:", error);
    });
}, 5 * 60 * 1000);
