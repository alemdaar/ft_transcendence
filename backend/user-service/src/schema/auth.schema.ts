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

export const verifyEmailSchema = z.object({
    email: z
        .email()
        .endsWith("@student.1337.ma"),
    code: z
        .string()
        .length(6)
        .regex(/^\d{6}$/)
});