import z from 'zod'

export const GroupSchema = z.object({
    name: z.string().trim().min(3).max(30),
    type: z.enum(['general', 'team']),
    description: z.string().trim().max(300).optional(),
    memberLimit: z.number().positive().min(2).max(6).optional()
}).refine(
    (data) => data.type !== 'team' || data.memberLimit !== undefined,
    {
        message: "memberLimit is required for team groups",
        path: ["memberLimit"]
    }
).refine(
    (data) => data.type !== "general" || data.memberLimit === undefined,
    {
        message: "memberLimit is not allowed for general groups",
        path: ["memberLimit"]
    }
);
