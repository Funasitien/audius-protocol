import { z } from 'zod';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<Prisma.Reward_manager_txsAvgAggregateInputType> = z
  .object({
    slot: z.literal(true).optional(),
  })
  .strict();

export const Reward_manager_txsAvgAggregateInputObjectSchema = Schema;
