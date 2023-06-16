import { z } from 'zod';
import { SortOrderSchema } from '../enums/SortOrder.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<Prisma.user_bank_txsMaxOrderByAggregateInput> = z
  .object({
    signature: z.lazy(() => SortOrderSchema).optional(),
    slot: z.lazy(() => SortOrderSchema).optional(),
    created_at: z.lazy(() => SortOrderSchema).optional(),
  })
  .strict();

export const user_bank_txsMaxOrderByAggregateInputObjectSchema = Schema;
