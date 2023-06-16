import { z } from 'zod';
import { SortOrderSchema } from '../enums/SortOrder.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<Prisma.aggregate_daily_unique_users_metricsAvgOrderByAggregateInput> =
  z
    .object({
      id: z.lazy(() => SortOrderSchema).optional(),
      count: z.lazy(() => SortOrderSchema).optional(),
      summed_count: z.lazy(() => SortOrderSchema).optional(),
    })
    .strict();

export const aggregate_daily_unique_users_metricsAvgOrderByAggregateInputObjectSchema =
  Schema;
