import { z } from 'zod';
import { id } from 'zod/locales';

export const validateStudySchema = z.object({
	topic: z.string().trim().min(1).max(100),
	description: z.string().trim().min(1).max(255),
	mode: z.enum(['online', 'insite']),
	// status: z.enum(['open', 'claimed', 'pending', 'completed', 'cancelled'])
});

export const SessionMessage = z.object({
	text: z.string().trim().min(1).max(500)
	
});


export const SessionMeetup = z.object({
	specificSpot: z.string().trim().min(5).max(100),
	meetTime: z.string().regex(/^([01][0-9]|2[0-3]):[0-5][0-9]$/)
});

export const paramIdObj = z.object({
  id: z.string()
    .regex(/^[1-9]\d*$/)
    .transform(Number)
    .pipe(z.number().max(2147483647)),
});