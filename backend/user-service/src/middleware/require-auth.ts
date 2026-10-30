import type { Request, Response, NextFunction } from "express";
import { findUserById } from "../services/auth.service";
import { verifyAccessTokenClaims } from "../services/jwt.service";

function authenticate(allowBearer: boolean) {
    return async (req: Request, res: Response, next: NextFunction) => {
        let userId = req.session.userId;
        let authVersion = req.session.authVersion;
        const authorization = req.get("authorization");
        if (authorization && allowBearer) {
            const match = /^Bearer ([^\s]+)$/i.exec(authorization);
            if (!match) return res.status(401).json({ error: "Invalid access token" });
            try {
                ({ userId, authVersion } = verifyAccessTokenClaims(match[1]!));
            } catch { return res.status(401).json({ error: "Invalid or expired access token" }); }
        }
        if (!userId || authVersion === undefined) return res.status(401).json({ error: "Not authenticated" });
        try {
            const user = await findUserById(userId);
            if (!user || user.authVersion !== authVersion) return res.status(401).json({ error: "Session or access token revoked" });
            res.locals.user = user;
            next();
        } catch (error) { next(error); }
    };
}

export const requireAuth = authenticate(true);
export const requireSession = authenticate(false);
