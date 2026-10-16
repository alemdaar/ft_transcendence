import { z } from 'zod';

export const validateStudySchema = z.object({
    topic: z.string().trim().min(1).max(255),
    description: z.string().trim().min(1).max(255),
    mode: z.enum(['online', 'insite']),
    status: z.enum(['open', 'claimed', 'completed', 'cancelled'])
});

// export const validateMeetup = z.object({
    
// })