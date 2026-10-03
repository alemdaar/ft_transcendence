import { z } from "zod";

export const registerSchema = z.object({
    email: z.email(),
    password: z.string().min(8).max(128),
    nickname: z.string().min(3).max(30),
    username: z.string().min(3).max(30),
    intraId: z.number().int().positive(),
    campus: z.string().min(1).max(100)
});