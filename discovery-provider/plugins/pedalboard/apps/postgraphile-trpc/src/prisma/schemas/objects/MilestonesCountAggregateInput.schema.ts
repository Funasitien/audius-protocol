import { z } from 'zod';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<Prisma.MilestonesCountAggregateInputType> = z
  .object({
    id: z.literal(true).optional(),
    name: z.literal(true).optional(),
    threshold: z.literal(true).optional(),
    blocknumber: z.literal(true).optional(),
    slot: z.literal(true).optional(),
    timestamp: z.literal(true).optional(),
    _all: z.literal(true).optional(),
  })
  .strict();

export const MilestonesCountAggregateInputObjectSchema = Schema;
