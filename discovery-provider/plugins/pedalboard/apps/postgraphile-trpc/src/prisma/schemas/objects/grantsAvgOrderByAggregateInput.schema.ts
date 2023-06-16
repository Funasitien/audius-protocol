import { z } from 'zod';
import { SortOrderSchema } from '../enums/SortOrder.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<Prisma.grantsAvgOrderByAggregateInput> = z
  .object({
    blocknumber: z.lazy(() => SortOrderSchema).optional(),
    user_id: z.lazy(() => SortOrderSchema).optional(),
  })
  .strict();

export const grantsAvgOrderByAggregateInputObjectSchema = Schema;
