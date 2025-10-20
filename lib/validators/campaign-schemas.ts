import { z } from 'zod';
import { CAMPAIGN_OBJECTIVES } from '@/lib/types/campaigns';

export const createCampaignSchema = z.object({
  brandId: z.string().uuid('Please select a valid brand'),
  adAccountId: z.string()
    .min(1, 'Ad Account ID is required')
    .max(255, 'Ad Account ID must be less than 255 characters'),
  name: z.string()
    .min(1, 'Campaign name is required')
    .max(255, 'Campaign name must be less than 255 characters'),
  objective: z.enum(CAMPAIGN_OBJECTIVES as [string, ...string[]], {
    errorMap: () => ({ message: 'Please select a valid campaign objective' })
  }),
  budget: z.number()
    .min(0.01, 'Budget must be greater than $0.01')
    .max(1000000, 'Budget cannot exceed $1,000,000'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
}).refine((data) => {
  // If both dates are provided, end date must be after start date
  if (data.startDate && data.endDate) {
    return new Date(data.endDate) > new Date(data.startDate);
  }
  return true;
}, {
  message: 'End date must be after start date',
  path: ['endDate'],
}).refine((data) => {
  // Start date cannot be in the past
  if (data.startDate) {
    return new Date(data.startDate) >= new Date();
  }
  return true;
}, {
  message: 'Start date cannot be in the past',
  path: ['startDate'],
});

export const updateCampaignSchema = createCampaignSchema.partial().extend({
  id: z.string().uuid(),
});

export type CreateCampaignFormData = z.infer<typeof createCampaignSchema>;
export type UpdateCampaignFormData = z.infer<typeof updateCampaignSchema>;
