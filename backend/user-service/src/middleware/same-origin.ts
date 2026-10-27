import type { Request, Response, NextFunction } from "express";
import { frontendUrl } from "../config/runtime";

export function sameOrigin(req: Request, res: Response, next: NextFunction) {
    if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return next();
    const origin = req.get("origin");
    const ownOrigin = `${req.protocol}://${req.get("host")}`;
    if ((origin && origin !== frontendUrl.origin && origin !== ownOrigin) ||
        (!origin && req.get("sec-fetch-site") === "cross-site")) {
        return res.status(403).json({ error: "Request origin is not allowed" });
    }
    next();
}
