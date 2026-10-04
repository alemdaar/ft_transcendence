import { Router } from "express";
import {
    register,
    verifyEmail
} from "../controllers/auth.controller";

import {
    register,
    verifyEmail,
    authorize42,
    callback42
} from "../controllers/auth.controller";

const authRouter = Router();

authRouter.post("/register", register);
authRouter.post("/verify-email", verifyEmail);

authRouter.get("/42", authorize42);
authRouter.get("/42/callback", callback42);

export default authRouter;