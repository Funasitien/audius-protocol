import { z } from 'zod';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<Prisma.RpclogMaxAggregateInputType> = z
  .object({
    cuid: z.literal(true).optional(),
    wallet: z.literal(true).optional(),
    method: z.literal(true).optional(),
    jetstream_seq: z.literal(true).optional(),
  })
  .strict();

export const RpclogMaxAggregateInputObjectSchema = Schema;
