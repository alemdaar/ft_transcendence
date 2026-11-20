import z from 'zod'

export const GroupSchema = z.object({
	name: z.string().trim().min(3).max(30),
	type: z.enum(['general', 'team']),
	description: z.string().trim().max(300).optional(),
	memberLimit: z.number().positive().min(2).max(6).optional()
}).refine(
	(data) => data.type !== 'team' || data.memberLimit !== undefined,
	{
		error: "memberLimit is required for team groups",
		path: ["memberLimit"]
	}
).refine(
	(data) => data.type !== "general" || data.memberLimit === undefined,
	{
		error: "memberLimit is not allowed for general groups",
		path: ["memberLimit"]
	}
)

const positiveInt = (name) => {
	const msg = `${name} must be a positif number.`
	return z.string({ error: msg })
		.refine(v => /^\d+$/.test(v) && Number(v) >= 1, { error: msg, abort: true })
		.refine(v => Number.isSafeInteger(Number(v)), { error: `${name} too big.` })
		.transform(Number);
}

export const pageQuerySchema = z.object({
	page: positiveInt("Page").optional()
})

export const idParamSchema = z.object({
	id: positiveInt("Id")
})

export const reqIdSchema = z.object({
	requestId: positiveInt("requestId")
})
