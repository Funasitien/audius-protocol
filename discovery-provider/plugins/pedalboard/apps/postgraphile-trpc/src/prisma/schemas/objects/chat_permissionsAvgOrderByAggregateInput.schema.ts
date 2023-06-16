import { z } from 'zod';
import { SortOrderSchema } from '../enums/SortOrder.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<Prisma.chat_permissionsAvgOrderByAggregateInput> = z
  .object({
    user_id: z.lazy(() => SortOrderSchema).optional(),
  })
  .strict();

export const chat_permissionsAvgOrderByAggregateInputObjectSchema = Schema;
