import { z } from 'zod';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<Prisma.Eth_blocksCountAggregateInputType> = z
  .object({
    last_scanned_block: z.literal(true).optional(),
    created_at: z.literal(true).optional(),
    updated_at: z.literal(true).optional(),
    _all: z.literal(true).optional(),
  })
  .strict();

export const Eth_blocksCountAggregateInputObjectSchema = Schema;
