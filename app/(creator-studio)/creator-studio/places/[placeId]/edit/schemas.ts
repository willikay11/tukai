import { z } from 'zod';

/**
 * Validation for the edit-place form.
 *
 * As in the create-experience wizard these schemas are the single source of
 * truth for both the rules and the form's shape — the step types are derived
 * with `z.infer` rather than declared by hand. Issue paths match the keys the
 * step components read, so `zodErrorsToMap` needs no translation.
 */
export { zodErrorsToMap } from '@/utils/zod-errors';

/** A photo already on the place, or one picked in this session. */
const editPhotoSchema = z.object({
  // The API id for a photo that exists, `new-{n}` for one that does not yet
  id: z.string(),
  url: z.string(),
  file: z.custom<File>().optional(),
  isCover: z.boolean().optional(),
});

export const aboutStepSchema = z.object({
  title: z.string().trim().min(1, 'Give the place a name'),
  // Rich text: empty paragraphs still carry markup, so the check is on the text
  description: z
    .string()
    .refine((html) => html.replace(/<[^>]*>/g, '').trim().length > 0, 'Describe the place'),
  address: z.string().trim().min(1, 'Pick the place on the map'),
  // Only set when the address came from a Google suggestion. Editing the text
  // by hand clears it, and the address alone is not something the API accepts.
  googleMapPlaceId: z.string(),
  entry: z.enum(['free', 'paid']),
  photos: z.array(editPhotoSchema).min(1, 'Add at least one photo'),
});

export const propertySchema = z.object({
  id: z.string(),
  key: z.string().trim().min(1, 'Name this detail'),
  value: z.string().trim().min(1, 'Add its value'),
  icon: z.string().optional(),
  canCopy: z.boolean().optional(),
});

export const propertiesStepSchema = z.object({
  properties: z.array(propertySchema),
});

export const socialLinkSchema = z.object({
  id: z.string(),
  platformName: z.string().trim().min(1, 'Name the platform'),
  url: z.string().trim().url('Enter a full link, starting with https://'),
  icon: z.string().optional(),
});

export const socialLinksStepSchema = z.object({
  socialLinks: z.array(socialLinkSchema),
});

export const editPlaceSchema = aboutStepSchema
  .merge(propertiesStepSchema)
  .merge(socialLinksStepSchema);

export type EditPhoto = z.infer<typeof editPhotoSchema>;
export type AboutStepValues = z.infer<typeof aboutStepSchema>;
export type PropertyValue = z.infer<typeof propertySchema>;
export type SocialLinkValue = z.infer<typeof socialLinkSchema>;
export type EditPlaceValues = z.infer<typeof editPlaceSchema>;
