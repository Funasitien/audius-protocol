import { z } from 'zod';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<Prisma.indexing_checkpointsCreateInput> = z
  .object({
    tablename: z.string(),
    last_checkpoint: z.number(),
    signature: z.string().optional().nullable(),
  })
  .strict();

export const indexing_checkpointsCreateInputObjectSchema = Schema;
