import { z } from 'zod';
import { StringFilterObjectSchema } from './StringFilter.schema';
import { IntFilterObjectSchema } from './IntFilter.schema';
import { BoolFilterObjectSchema } from './BoolFilter.schema';
import { IntNullableFilterObjectSchema } from './IntNullableFilter.schema';
import { ChallengesRelationFilterObjectSchema } from './ChallengesRelationFilter.schema';
import { challengesWhereInputObjectSchema } from './challengesWhereInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<Prisma.user_challengesWhereInput> = z
  .object({
    AND: z
      .union([
        z.lazy(() => user_challengesWhereInputObjectSchema),
        z.lazy(() => user_challengesWhereInputObjectSchema).array(),
      ])
      .optional(),
    OR: z
      .lazy(() => user_challengesWhereInputObjectSchema)
      .array()
      .optional(),
    NOT: z
      .union([
        z.lazy(() => user_challengesWhereInputObjectSchema),
        z.lazy(() => user_challengesWhereInputObjectSchema).array(),
      ])
      .optional(),
    challenge_id: z
      .union([z.lazy(() => StringFilterObjectSchema), z.string()])
      .optional(),
    user_id: z
      .union([z.lazy(() => IntFilterObjectSchema), z.number()])
      .optional(),
    specifier: z
      .union([z.lazy(() => StringFilterObjectSchema), z.string()])
      .optional(),
    is_complete: z
      .union([z.lazy(() => BoolFilterObjectSchema), z.boolean()])
      .optional(),
    current_step_count: z
      .union([z.lazy(() => IntNullableFilterObjectSchema), z.number()])
      .optional()
      .nullable(),
    completed_blocknumber: z
      .union([z.lazy(() => IntNullableFilterObjectSchema), z.number()])
      .optional()
      .nullable(),
    challenges: z
      .union([
        z.lazy(() => ChallengesRelationFilterObjectSchema),
        z.lazy(() => challengesWhereInputObjectSchema),
      ])
      .optional(),
  })
  .strict();

export const user_challengesWhereInputObjectSchema = Schema;
