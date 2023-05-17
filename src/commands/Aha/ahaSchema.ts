import { z } from 'zod';

export const newAhaSchema = z.object({
  ahaNumber: z.number().int().positive(),
  ahaUrl: z.string().url().endsWith('.gif'),
});

export type NewAha = z.infer<typeof newAhaSchema>;
