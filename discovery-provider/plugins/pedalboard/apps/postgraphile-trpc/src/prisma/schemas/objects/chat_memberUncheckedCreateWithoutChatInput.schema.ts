import { z } from 'zod';
import { chat_messageUncheckedCreateNestedManyWithoutChat_memberInputObjectSchema } from './chat_messageUncheckedCreateNestedManyWithoutChat_memberInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<Prisma.chat_memberUncheckedCreateWithoutChatInput> = z
  .object({
    user_id: z.number(),
    cleared_history_at: z.coerce.date().optional().nullable(),
    invited_by_user_id: z.number(),
    invite_code: z.string(),
    last_active_at: z.coerce.date().optional().nullable(),
    unread_count: z.number().optional(),
    chat_message: z
      .lazy(
        () =>
          chat_messageUncheckedCreateNestedManyWithoutChat_memberInputObjectSchema,
      )
      .optional(),
  })
  .strict();

export const chat_memberUncheckedCreateWithoutChatInputObjectSchema = Schema;
