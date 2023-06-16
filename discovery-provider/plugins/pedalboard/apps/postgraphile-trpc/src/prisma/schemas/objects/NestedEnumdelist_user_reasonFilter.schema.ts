import { z } from 'zod';
import { delist_user_reasonSchema } from '../enums/delist_user_reason.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<Prisma.NestedEnumdelist_user_reasonFilter> = z
  .object({
    equals: z.lazy(() => delist_user_reasonSchema).optional(),
    in: z
      .union([
        z.lazy(() => delist_user_reasonSchema).array(),
        z.lazy(() => delist_user_reasonSchema),
      ])
      .optional(),
    notIn: z
      .union([
        z.lazy(() => delist_user_reasonSchema).array(),
        z.lazy(() => delist_user_reasonSchema),
      ])
      .optional(),
    not: z
      .union([
        z.lazy(() => delist_user_reasonSchema),
        z.lazy(() => NestedEnumdelist_user_reasonFilterObjectSchema),
      ])
      .optional(),
  })
  .strict();

export const NestedEnumdelist_user_reasonFilterObjectSchema = Schema;
