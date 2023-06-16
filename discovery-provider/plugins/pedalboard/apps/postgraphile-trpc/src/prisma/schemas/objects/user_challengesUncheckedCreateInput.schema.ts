import { z } from 'zod';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<Prisma.user_challengesUncheckedCreateInput> = z
  .object({
    challenge_id: z.string(),
    user_id: z.number(),
    specifier: z.string(),
    is_complete: z.boolean(),
    current_step_count: z.number().optional().nullable(),
    completed_blocknumber: z.number().optional().nullable(),
  })
  .strict();

export const user_challengesUncheckedCreateInputObjectSchema = Schema;
