import { z } from 'zod';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<Prisma.stemsCreateManyInput> = z
  .object({
    parent_track_id: z.number(),
    child_track_id: z.number(),
  })
  .strict();

export const stemsCreateManyInputObjectSchema = Schema;
