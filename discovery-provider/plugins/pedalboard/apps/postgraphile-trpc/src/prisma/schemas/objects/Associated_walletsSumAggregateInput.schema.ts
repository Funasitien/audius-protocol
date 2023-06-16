import { z } from 'zod';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<Prisma.Associated_walletsSumAggregateInputType> = z
  .object({
    id: z.literal(true).optional(),
    user_id: z.literal(true).optional(),
    blocknumber: z.literal(true).optional(),
  })
  .strict();

export const Associated_walletsSumAggregateInputObjectSchema = Schema;
