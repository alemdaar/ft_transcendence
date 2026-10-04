import { z } from "zod";

export const registerSchema = z.object({
    email: z
        .email()
        .endsWith("@student.1337.ma"),
    password: z
        .string()
        .min(8)
        .max(128)
});