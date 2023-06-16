import { z } from 'zod';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<Prisma.Schema_migrationsMaxAggregateInputType> = z
  .object({
    version: z.literal(true).optional(),
  })
  .strict();

export const Schema_migrationsMaxAggregateInputObjectSchema = Schema;
