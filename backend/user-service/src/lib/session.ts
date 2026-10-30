import type { Request, Response } from "express";
import type { User } from "../generated/prisma/client";

export function saveSession(req: Request): Promise<void> {
    return new Promise((resolve, reject) => req.session.save(error => error ? reject(error) : resolve()));
}

export async function signIn(req: Request, user: User, method: "password" | "42") {
    await new Promise<void>((resolve, reject) => req.session.regenerate(error => error ? reject(error) : resolve()));
    req.session.userId = user.id;
    req.session.authVersion = user.authVersion;
    req.session.authenticatedAt = Date.now();
    req.session.authMethod = method;
    await saveSession(req);
}

export async function destroySession(req: Request, res: Response) {
    await new Promise<void>((resolve, reject) => req.session.destroy(error => error ? reject(error) : resolve()));
    res.clearCookie("ft.sid", { path: "/" });
}
