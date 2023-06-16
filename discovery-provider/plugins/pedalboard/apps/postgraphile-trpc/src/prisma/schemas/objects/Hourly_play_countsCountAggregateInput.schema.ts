import { z } from 'zod';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<Prisma.Hourly_play_countsCountAggregateInputType> = z
  .object({
    hourly_timestamp: z.literal(true).optional(),
    play_count: z.literal(true).optional(),
    _all: z.literal(true).optional(),
  })
  .strict();

export const Hourly_play_countsCountAggregateInputObjectSchema = Schema;
