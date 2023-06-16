import { z } from 'zod';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<Prisma.Rewards_manager_backfill_txsAvgAggregateInputType> =
  z
    .object({
      slot: z.literal(true).optional(),
    })
    .strict();

export const Rewards_manager_backfill_txsAvgAggregateInputObjectSchema = Schema;
