import { z } from "zod";

export const registerSchema = z.object({
    email: z
        .email()
        .endsWith("@student.1337.ma"),

    password: z
        .string()
        .min(8)
        .max(128),

    confirmpassword: z.string()
}).refine(
    (data) => data.password === data.confirmpassword,
    {
        message: "Passwords do not match",
        path: ["confirmpassword"]
    }
);

export const verifyEmailSchema = z.object({
    email: z
        .email()
        .endsWith("@student.1337.ma"),
    code: z
        .string()
        .length(6)
        .regex(/^\d{6}$/)
});

export const loginSchema = z.object({
    email: z
        .email()
        .endsWith("@student.1337.ma"),

    password: z
        .string()
        .min(1)
        .max(128)
});
