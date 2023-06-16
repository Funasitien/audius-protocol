import { z } from 'zod';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<Prisma.User_delist_statusesMaxAggregateInputType> = z
  .object({
    created_at: z.literal(true).optional(),
    user_id: z.literal(true).optional(),
    delisted: z.literal(true).optional(),
    reason: z.literal(true).optional(),
  })
  .strict();

export const User_delist_statusesMaxAggregateInputObjectSchema = Schema;
