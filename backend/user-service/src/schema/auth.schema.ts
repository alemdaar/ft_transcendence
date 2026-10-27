import { z } from "zod";

export const studentEmailSchema = z.string().trim().toLowerCase().pipe(
    z.email().max(254).endsWith("@student.1337.ma")
);
const passwordSchema = z.string().min(8).max(128);
export const emailSchema = z.object({ email: studentEmailSchema });

export const registerSchema = z.object({
    email: studentEmailSchema,
    password: passwordSchema,
    confirmpassword: z.string().max(128)
}).refine(data => data.password === data.confirmpassword, {
    message: "Passwords do not match", path: ["confirmpassword"]
});

export const verifyEmailSchema = z.object({
    email: studentEmailSchema,
    code: z.string().regex(/^\d{6}$/)
});

export const loginSchema = z.object({
    email: studentEmailSchema,
    password: z.string().min(1).max(128)
});

export const profileSchema = z.strictObject({
    displayname: z.string().trim().min(1).max(80).optional(),
    location: z.string().trim().max(80).nullable().optional(),
    avatarUrl: z.url({ protocol: /^https$/ }).max(2048).nullable().optional()
}).refine(data => Object.keys(data).length > 0, { message: "Provide at least one profile field" });

export const changePasswordSchema = z.object({
    currentPassword: z.string().min(1).max(128),
    password: passwordSchema,
    confirmpassword: z.string().max(128)
}).refine(data => data.password === data.confirmpassword, {
    message: "Passwords do not match", path: ["confirmpassword"]
});

export const resetPasswordSchema = z.object({
    token: z.string().regex(/^[a-f0-9]{64}$/),
    password: passwordSchema,
    confirmpassword: z.string().max(128)
}).refine(data => data.password === data.confirmpassword, {
    message: "Passwords do not match", path: ["confirmpassword"]
});

export const deleteAccountSchema = z.object({
    confirmation: z.literal("DELETE"),
    currentPassword: z.string().min(1).max(128).optional()
});
