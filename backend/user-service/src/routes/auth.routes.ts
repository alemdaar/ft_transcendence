import express from "express";
import { avatarDir } from "../services/avatar.service";
import { Router } from "express";
import { register, verifyEmail, resendVerificationCode, authorize42, callback42, login, me, logout, issueAccessToken } from "../controllers/auth.controller";
import { editProfile, changePassword, forgotPassword, resetPassword, deleteAccount, uploadAvatar} from "../controllers/account.controller";
import {
    registerRateLimit, verifyEmailRateLimit, resendCodeRateLimit, loginRateLimit,
    passwordResetRateLimit, sensitiveRateLimit, oauthRateLimit, accountRateLimit
} from "../middleware/auth-rate-limit";
import { requireAuth, requireSession } from "../middleware/require-auth";
import { avatarUpload } from "../middleware/avatar-upload";

const authRouter = Router();
authRouter.use((_req, res, next) => { res.set("Cache-Control", "no-store"); next(); });
authRouter.post("/register", registerRateLimit, accountRateLimit("register", 5, 15), register);
authRouter.post("/verify-email", verifyEmailRateLimit, accountRateLimit("verify", 10, 5), verifyEmail);
authRouter.post("/resend-code", resendCodeRateLimit, accountRateLimit("resend", 3, 15), resendVerificationCode);
authRouter.post("/login", loginRateLimit, accountRateLimit("login", 10, 15), login);
authRouter.get("/me", requireAuth, me);
authRouter.patch("/me", requireSession, editProfile);
authRouter.post(
    "/me/avatar",
    requireSession,
    avatarUpload,
    uploadAvatar
);
authRouter.post("/logout", requireSession, logout);
authRouter.post("/token", requireSession, issueAccessToken);
authRouter.post("/change-password", sensitiveRateLimit, requireSession, changePassword);
authRouter.post("/forgot-password", passwordResetRateLimit, accountRateLimit("forgot", 3, 15), forgotPassword);
authRouter.post("/reset-password", passwordResetRateLimit, resetPassword);
authRouter.delete("/me", sensitiveRateLimit, requireSession, deleteAccount);
authRouter.get("/42", oauthRateLimit, authorize42);
authRouter.get("/42/callback", oauthRateLimit, callback42);
authRouter.use(
    "/avatars",
    express.static(avatarDir, {
        index: false,
        dotfiles: "deny",
        maxAge: "1d"
    })
);
export default authRouter;
