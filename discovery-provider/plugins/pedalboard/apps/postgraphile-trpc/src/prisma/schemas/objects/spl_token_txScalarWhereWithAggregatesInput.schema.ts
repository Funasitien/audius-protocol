import { z } from 'zod';
import { IntWithAggregatesFilterObjectSchema } from './IntWithAggregatesFilter.schema';
import { StringWithAggregatesFilterObjectSchema } from './StringWithAggregatesFilter.schema';
import { DateTimeWithAggregatesFilterObjectSchema } from './DateTimeWithAggregatesFilter.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<Prisma.spl_token_txScalarWhereWithAggregatesInput> = z
  .object({
    AND: z
      .union([
        z.lazy(() => spl_token_txScalarWhereWithAggregatesInputObjectSchema),
        z
          .lazy(() => spl_token_txScalarWhereWithAggregatesInputObjectSchema)
          .array(),
      ])
      .optional(),
    OR: z
      .lazy(() => spl_token_txScalarWhereWithAggregatesInputObjectSchema)
      .array()
      .optional(),
    NOT: z
      .union([
        z.lazy(() => spl_token_txScalarWhereWithAggregatesInputObjectSchema),
        z
          .lazy(() => spl_token_txScalarWhereWithAggregatesInputObjectSchema)
          .array(),
      ])
      .optional(),
    last_scanned_slot: z
      .union([z.lazy(() => IntWithAggregatesFilterObjectSchema), z.number()])
      .optional(),
    signature: z
      .union([z.lazy(() => StringWithAggregatesFilterObjectSchema), z.string()])
      .optional(),
    created_at: z
      .union([
        z.lazy(() => DateTimeWithAggregatesFilterObjectSchema),
        z.coerce.date(),
      ])
      .optional(),
    updated_at: z
      .union([
        z.lazy(() => DateTimeWithAggregatesFilterObjectSchema),
        z.coerce.date(),
      ])
      .optional(),
  })
  .strict();

export const spl_token_txScalarWhereWithAggregatesInputObjectSchema = Schema;
