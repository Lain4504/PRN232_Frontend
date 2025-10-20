import { z } from 'zod';
import { CREATIVE_FILE_LIMITS } from '@/lib/types/creatives';

// Creative type enum
const creativeTypeEnum = z.enum(['IMAGE', 'VIDEO', 'CAROUSEL', 'TEXT', 'GIF', 'STORY']);

// Image file validation
const imageFileSchema = z
  .instanceof(File)
  .refine((file) => file.size > 0, 'Image file is required')
  .refine((file) => file.size <= CREATIVE_FILE_LIMITS.IMAGE.maxSize, 'Image file size must be less than 30MB')
  .refine(
    (file) => CREATIVE_FILE_LIMITS.IMAGE.formats.includes(file.name.split('.').pop()?.toLowerCase() || ''),
    'Image must be JPG, PNG, or WebP format'
  );

// Video file validation
const videoFileSchema = z
  .instanceof(File)
  .refine((file) => file.size > 0, 'Video file is required')
  .refine((file) => file.size <= CREATIVE_FILE_LIMITS.VIDEO.maxSize, 'Video file size must be less than 4GB')
  .refine(
    (file) => CREATIVE_FILE_LIMITS.VIDEO.formats.includes(file.name.split('.').pop()?.toLowerCase() || ''),
    'Video must be MP4 or MOV format'
  );

// GIF file validation
const gifFileSchema = z
  .instanceof(File)
  .refine((file) => file.size > 0, 'GIF file is required')
  .refine((file) => file.size <= CREATIVE_FILE_LIMITS.GIF.maxSize, 'GIF file size must be less than 10MB')
  .refine(
    (file) => file.name.toLowerCase().endsWith('.gif'),
    'File must be a GIF format'
  );

// Create creative schema
export const createCreativeSchema = z.object({
  adSetId: z.string().min(1, 'Ad Set ID is required'),
  name: z
    .string()
    .min(1, 'Creative name is required')
    .max(255, 'Creative name must be less than 255 characters'),
  type: creativeTypeEnum,
  content: z.string().optional(),
  mediaFile: z.any().optional(),
  tags: z
    .array(z.string().max(50, 'Tag must be less than 50 characters'))
    .max(10, 'Maximum 10 tags allowed')
    .optional()
    .default([])
}).refine((data) => {
  // Require media file for IMAGE, VIDEO, and GIF types
  if (['IMAGE', 'VIDEO', 'GIF'].includes(data.type) && !data.mediaFile) {
    return false;
  }
  return true;
}, {
  message: 'Media file is required for IMAGE, VIDEO, and GIF types',
  path: ['mediaFile']
}).refine((data) => {
  // Require content for TEXT type
  if (data.type === 'TEXT' && (!data.content || data.content.trim().length === 0)) {
    return false;
  }
  return true;
}, {
  message: 'Content is required for TEXT type',
  path: ['content']
}).refine((data) => {
  // Validate file type and size based on creative type
  if (data.mediaFile && data.type === 'IMAGE') {
    try {
      imageFileSchema.parse(data.mediaFile);
    } catch {
      return false;
    }
  }
  if (data.mediaFile && data.type === 'VIDEO') {
    try {
      videoFileSchema.parse(data.mediaFile);
    } catch {
      return false;
    }
  }
  if (data.mediaFile && data.type === 'GIF') {
    try {
      gifFileSchema.parse(data.mediaFile);
    } catch {
      return false;
    }
  }
  return true;
}, {
  message: 'Invalid file format or size for the selected creative type',
  path: ['mediaFile']
});

// Update creative schema
export const updateCreativeSchema = z.object({
  id: z.string().min(1, 'Creative ID is required'),
  name: z
    .string()
    .min(1, 'Creative name is required')
    .max(255, 'Creative name must be less than 255 characters')
    .optional(),
  type: creativeTypeEnum.optional(),
  content: z.string().optional(),
  mediaFile: z.any().optional(),
  tags: z
    .array(z.string().max(50, 'Tag must be less than 50 characters'))
    .max(10, 'Maximum 10 tags allowed')
    .optional(),
  isActive: z.boolean().optional()
});

// Creative filters schema
export const creativeFiltersSchema = z.object({
  adSetId: z.string().optional(),
  type: creativeTypeEnum.optional(),
  tags: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['name', 'type', 'createdAt', 'performance']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional()
});

// Creative list params schema
export const creativeListParamsSchema = z.object({
  adSetId: z.string().min(1, 'Ad Set ID is required'),
  page: z.number().min(1).optional().default(1),
  pageSize: z.number().min(1).max(100).optional().default(20),
  search: z.string().optional(),
  type: creativeTypeEnum.optional(),
  tags: z.array(z.string()).optional(),
  sortBy: z.enum(['name', 'type', 'createdAt', 'performance']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc')
});

// Type exports
export type CreateCreativeFormData = z.infer<typeof createCreativeSchema>;
export type UpdateCreativeFormData = z.infer<typeof updateCreativeSchema>;
export type CreativeFiltersData = z.infer<typeof creativeFiltersSchema>;
export type CreativeListParamsData = z.infer<typeof creativeListParamsSchema>;
