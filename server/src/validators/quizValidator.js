import { z } from 'zod';

export const submitQuizSchema = z.object({
  answers: z.record(z.string(), z.union([z.string(), z.number()])),
});
