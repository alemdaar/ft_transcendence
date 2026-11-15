import { z } from "zod";

// PostgreSQL Int IDs are signed 32-bit; cap the batch size to bound query cost.
export const batchUserLookupSchema = z.strictObject({
    ids: z.array(z.number().int().min(1).max(2147483647)).max(100)
});
