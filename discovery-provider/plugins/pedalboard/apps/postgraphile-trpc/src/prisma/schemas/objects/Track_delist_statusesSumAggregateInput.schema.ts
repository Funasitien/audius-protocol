import { z } from 'zod';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<Prisma.Track_delist_statusesSumAggregateInputType> = z
  .object({
    track_id: z.literal(true).optional(),
    owner_id: z.literal(true).optional(),
  })
  .strict();

export const Track_delist_statusesSumAggregateInputObjectSchema = Schema;
