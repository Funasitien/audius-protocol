import { z } from 'zod';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<Prisma.hourly_play_countsCreateManyInput> = z
  .object({
    hourly_timestamp: z.coerce.date(),
    play_count: z.number(),
  })
  .strict();

export const hourly_play_countsCreateManyInputObjectSchema = Schema;
