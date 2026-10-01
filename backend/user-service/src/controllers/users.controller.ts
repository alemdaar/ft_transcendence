import { Request, Response } from "express";
import { findUserById } from "../services/users.service";

export function getUserById(req: Request, res: Response) {
    const id = Number(req.params.id);

    const user = findUserById(id);

    if (!user) {
        return res.status(404).json({
            error: "User not found"
        });
    }

    return res.status(200).json(user);
}