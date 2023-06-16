import { z } from 'zod';
import { SortOrderSchema } from '../enums/SortOrder.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<Prisma.rpclogSumOrderByAggregateInput> = z
  .object({
    jetstream_seq: z.lazy(() => SortOrderSchema).optional(),
  })
  .strict();

export const rpclogSumOrderByAggregateInputObjectSchema = Schema;
