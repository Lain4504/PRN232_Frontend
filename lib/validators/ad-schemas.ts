import { z } from 'zod';
import type { AdStatus } from '@/lib/types/ads';

export const AD_STATUSES = [
  "DRAFT",
  "ACTIVE",
  "PAUSED",
  "STOPPED",
  "REJECTED",
  "PENDING_REVIEW",
] as const satisfies readonly AdStatus[];

export const createAdSchema = z.object({
  adSetId: z.string().uuid('Ad Set ID is required'),
  creativeId: z.string().uuid('Creative ID is required'),
  name: z.string()
    .min(1, 'Ad name is required')
    .max(255, 'Ad name must be less than 255 characters'),
  targeting: z.unknown().optional(),
  schedule: z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    timezone: z.string().optional(),
  }).optional(),
});

export const updateAdSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  creativeId: z.string().uuid().optional(),
  targeting: z.unknown().optional(),
  schedule: z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    timezone: z.string().optional(),
  }).optional(),
});

export const updateAdStatusSchema = z.object({
  status: z.enum(AD_STATUSES),
});

export type CreateAdFormData = z.infer<typeof createAdSchema>;
export type UpdateAdFormData = z.infer<typeof updateAdSchema>;
export type UpdateAdStatusFormData = z.infer<typeof updateAdStatusSchema>;


