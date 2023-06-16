import { z } from 'zod';
import { developer_appsUncheckedCreateNestedManyWithoutBlocks_developer_apps_blockhashToblocksInputObjectSchema } from './developer_appsUncheckedCreateNestedManyWithoutBlocks_developer_apps_blockhashToblocksInput.schema';
import { developer_appsUncheckedCreateNestedManyWithoutBlocks_developer_apps_blocknumberToblocksInputObjectSchema } from './developer_appsUncheckedCreateNestedManyWithoutBlocks_developer_apps_blocknumberToblocksInput.schema';
import { grantsUncheckedCreateNestedManyWithoutBlocks_grants_blockhashToblocksInputObjectSchema } from './grantsUncheckedCreateNestedManyWithoutBlocks_grants_blockhashToblocksInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<Prisma.blocksUncheckedCreateWithoutGrants_grants_blocknumberToblocksInput> =
  z
    .object({
      blockhash: z.string(),
      parenthash: z.string().optional().nullable(),
      is_current: z.boolean().optional().nullable(),
      number: z.number().optional().nullable(),
      developer_apps_developer_apps_blockhashToblocks: z
        .lazy(
          () =>
            developer_appsUncheckedCreateNestedManyWithoutBlocks_developer_apps_blockhashToblocksInputObjectSchema,
        )
        .optional(),
      developer_apps_developer_apps_blocknumberToblocks: z
        .lazy(
          () =>
            developer_appsUncheckedCreateNestedManyWithoutBlocks_developer_apps_blocknumberToblocksInputObjectSchema,
        )
        .optional(),
      grants_grants_blockhashToblocks: z
        .lazy(
          () =>
            grantsUncheckedCreateNestedManyWithoutBlocks_grants_blockhashToblocksInputObjectSchema,
        )
        .optional(),
    })
    .strict();

export const blocksUncheckedCreateWithoutGrants_grants_blocknumberToblocksInputObjectSchema =
  Schema;
