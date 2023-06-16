import { z } from 'zod';
import { SortOrderSchema } from '../enums/SortOrder.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<Prisma.challengesAvgOrderByAggregateInput> = z
  .object({
    step_count: z.lazy(() => SortOrderSchema).optional(),
    starting_block: z.lazy(() => SortOrderSchema).optional(),
  })
  .strict();

export const challengesAvgOrderByAggregateInputObjectSchema = Schema;
