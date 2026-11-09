import type { Request, Response, NextFunction } from "express";
import { HttpError } from "../lib/http-error";

export function errorHandler(error: unknown, _req: Request, res: Response, next: NextFunction) {
    if (res.headersSent) return next(error);
    if (error instanceof HttpError) {
        if (error.retryAfter !== undefined) res.set("Retry-After", String(error.retryAfter));
        return res.status(error.status).json({ error: error.message, ...(error.retryAfter !== undefined ? { retryAfter: error.retryAfter } : {}) });
    }
    const info = error as { type?: string; code?: string; name?: string } | null;
    if (info?.type === "entity.parse.failed") return res.status(400).json({ error: "Invalid JSON body" });
    if (info?.type === "entity.too.large") return res.status(413).json({ error: "Request body too large" });
    if (info?.type === "charset.unsupported" || info?.type === "encoding.unsupported") {
        return res.status(415).json({ error: "Unsupported request encoding" });
    }
    if (info?.code === "P2002") return res.status(409).json({ error: "Account identity already exists" });
    if (info?.code === "P2025") return res.status(401).json({ error: "Account changed. Please sign in again." });
    if (info?.name === "TimeoutError" || info?.name === "AbortError") return res.status(502).json({ error: "Upstream request timed out" });
    console.error("Backend error:", error);
    return res.status(500).json({ error: "Internal server error" });
}
