import { z } from 'zod';

// Age range validation
const ageRangeSchema = z.object({
  min: z.number().min(13, 'Minimum age must be at least 13').max(65, 'Maximum age must be at most 65'),
  max: z.number().min(13, 'Minimum age must be at least 13').max(65, 'Maximum age must be at most 65'),
}).refine((data) => data.min <= data.max, {
  message: 'Minimum age must be less than or equal to maximum age',
  path: ['min'],
});

// Location targeting validation
const locationTargetingSchema = z.object({
  country: z.string().optional(),
  region: z.string().optional(),
  city: z.string().optional(),
  radius: z.number().min(1).max(50).optional(),
  coordinates: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
  }).optional(),
}).refine((data) => data.country || data.region || data.city || data.coordinates, {
  message: 'At least one location criteria must be specified',
});

// Demographics targeting validation
const demographicsTargetingSchema = z.object({
  education: z.array(z.string()).optional(),
  relationshipStatus: z.array(z.string()).optional(),
  workEmployers: z.array(z.string()).optional(),
  workPositions: z.array(z.string()).optional(),
});

// Gender targeting validation
const genderTargetingSchema = z.object({
  male: z.boolean().optional(),
  female: z.boolean().optional(),
}).refine((data) => data.male || data.female, {
  message: 'At least one gender must be selected',
});

// Targeting configuration validation
const targetingConfigSchema = z.object({
  demographics: demographicsTargetingSchema.optional(),
  interests: z.array(z.string()).min(1, 'At least one interest must be selected').optional(),
  behaviors: z.array(z.string()).optional(),
  locations: z.array(locationTargetingSchema).min(1, 'At least one location must be specified').optional(),
  ageRange: ageRangeSchema.optional(),
  gender: genderTargetingSchema.optional(),
  customAudiences: z.array(z.string()).optional(),
  lookalikeAudiences: z.array(z.string()).optional(),
}).refine((data) => {
  // At least one targeting criteria must be specified
  return data.demographics || 
         data.interests || 
         data.behaviors || 
         data.locations || 
         data.ageRange || 
         data.gender || 
         data.customAudiences || 
         data.lookalikeAudiences;
}, {
  message: 'At least one targeting criteria must be specified',
});

// Schedule validation
const scheduleSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  timezone: z.string().optional(),
}).refine((data) => {
  if (data.startDate && data.endDate) {
    return new Date(data.startDate) < new Date(data.endDate);
  }
  return true;
}, {
  message: 'End date must be after start date',
  path: ['endDate'],
});

// Create ad set schema
export const createAdSetSchema = z.object({
  campaignId: z.string().min(1, 'Campaign ID is required'),
  name: z.string()
    .min(1, 'Ad set name is required')
    .max(255, 'Ad set name must be less than 255 characters'),
  targeting: targetingConfigSchema,
  budget: z.number()
    .min(0.01, 'Budget must be greater than 0')
    .max(10000, 'Budget cannot exceed $10,000 per day'),
  schedule: scheduleSchema.optional(),
});

// Update ad set schema
export const updateAdSetSchema = createAdSetSchema.partial().extend({
  id: z.string().min(1, 'Ad set ID is required'),
});

// Ad set filters schema
export const adSetFiltersSchema = z.object({
  campaignId: z.string().optional(),
  status: z.enum(['active', 'paused', 'completed']).optional(),
  budgetRange: z.object({
    min: z.number().min(0).optional(),
    max: z.number().min(0).optional(),
  }).optional(),
});

// Ad set list params schema
export const adSetListParamsSchema = z.object({
  campaignId: z.string().min(1, 'Campaign ID is required'),
  page: z.number().min(1).optional(),
  pageSize: z.number().min(1).max(100).optional(),
  search: z.string().optional(),
  status: z.string().optional(),
  sortBy: z.enum(['name', 'budget', 'createdAt', 'performance']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

// Type exports
export type CreateAdSetFormData = z.infer<typeof createAdSetSchema>;
export type UpdateAdSetFormData = z.infer<typeof updateAdSetSchema>;
export type AdSetFiltersFormData = z.infer<typeof adSetFiltersSchema>;
export type AdSetListParamsFormData = z.infer<typeof adSetListParamsSchema>;
