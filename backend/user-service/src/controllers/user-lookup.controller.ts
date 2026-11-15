import type { Request, Response } from "express";
import { batchUserLookupSchema } from "../schema/user-lookup.schema";
import { findUsersByIds } from "../services/user-lookup.service";

export async function batchUsers(req: Request, res: Response) {
    const result = batchUserLookupSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({
            error: "Invalid user IDs",
            details: result.error.issues
        });
    }

    const ids = [...new Set(result.data.ids)];
    if (ids.length === 0) return res.json([]);

    const users = await findUsersByIds(ids);
    const byId = new Map(users.map(user => [user.id, user]));

    // One object per existing ID, preserving input order and excluding private fields.
    return res.json(ids.flatMap(id => {
        const user = byId.get(id);
        return user ? [user] : [];
    }));
}
