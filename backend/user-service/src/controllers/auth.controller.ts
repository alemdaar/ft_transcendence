import type { Request, Response } from "express";
import argon2 from "argon2";
import { Prisma } from "../generated/prisma/client";
import { registerSchema } from "../schemas/auth.schema";
import { createUser } from "../services/auth.service";

export async function register(req: Request, res: Response) {
    const result = registerSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            error: "Invalid registration data"
        });
    }

    const { password, ...userData } = result.data;
    const passwordHash = await argon2.hash(password);

    try {
        const user = await createUser({ ...userData, passwordHash });
        return res.status(201).json({ data: user });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
            return res.status(409).json({
                error: "A user with these registration details already exists"
            });
        }

        throw error;
    }
}
