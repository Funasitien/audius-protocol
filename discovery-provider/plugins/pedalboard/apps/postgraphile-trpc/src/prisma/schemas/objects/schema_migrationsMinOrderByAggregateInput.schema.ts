import { z } from 'zod';
import { SortOrderSchema } from '../enums/SortOrder.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<Prisma.schema_migrationsMinOrderByAggregateInput> = z
  .object({
    version: z.lazy(() => SortOrderSchema).optional(),
  })
  .strict();

export const schema_migrationsMinOrderByAggregateInputObjectSchema = Schema;
