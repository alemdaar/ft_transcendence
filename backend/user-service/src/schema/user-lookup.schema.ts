import { z } from "zod";

export const batchUserLookupSchema = z.strictObject({
    ids: z.array(z.number().int().min(1).max(2147483647))
});