import { z } from 'zod';
import { MAX_HASHTAGS, normalizeHashtag, normalizeHashtags } from './hashtags.js';

export const loginSchema = z.object({
  username: z.string().trim().min(1).max(80),
  password: z.string().min(1).max(255),
});

export const journalInputSchema = z.object({
  campingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  placeName: z.string().trim().min(1).max(160),
  address: z.string().trim().min(1).max(255),
  shortMemo: z.string().trim().min(1).max(10000),
  isPrivate: z.boolean().optional().default(false),
  hashtags: z
    .array(z.string().trim().min(1).max(41))
    .max(MAX_HASHTAGS)
    .optional()
    .default([])
    .transform((values, context) => {
      if (values.some((value) => !normalizeHashtag(value))) {
        context.addIssue({
          code: 'custom',
          message: '해시태그 형식이 올바르지 않습니다.',
        });
        return z.NEVER;
      }

      return normalizeHashtags(values);
    }),
});

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const mediaParamSchema = z.object({
  id: z.coerce.number().int().positive(),
  mediaId: z.coerce.number().int().positive(),
});

export const uploadFileParamSchema = z.object({
  fileName: z.string().trim().min(1).max(255),
});
