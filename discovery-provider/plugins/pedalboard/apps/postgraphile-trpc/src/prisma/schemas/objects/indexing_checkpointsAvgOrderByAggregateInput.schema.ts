import { z } from 'zod';
import { SortOrderSchema } from '../enums/SortOrder.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<Prisma.indexing_checkpointsAvgOrderByAggregateInput> = z
  .object({
    last_checkpoint: z.lazy(() => SortOrderSchema).optional(),
  })
  .strict();

export const indexing_checkpointsAvgOrderByAggregateInputObjectSchema = Schema;
