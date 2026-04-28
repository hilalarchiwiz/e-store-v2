import { z } from 'zod';

export const SubscribeSchema = z.object({
    email: z
        .string()
        .min(1, 'Email is required')
        .email('Invalid email address'),
});

// This helps TypeScript understand the shape of your validated data
export type SubscribeInput = z.infer<typeof SubscribeSchema>;