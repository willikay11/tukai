import { z } from 'zod';

/**
 * The new-place branch's own required fields - per the project's zod
 * convention, this is the single source of truth for both validation and the
 * form's type (via z.infer), rather than a hand-written shape checked by ad
 * hoc booleans. Photos are kept outside this schema (see NewPlaceDraft in
 * useConnectPlaceDrawer.ts) since they are optional and are File objects
 * rather than form text.
 */
export const newPlaceDraftSchema = z.object({
  title: z.string().trim().min(1),
  country: z.string().min(1),
  town: z.string().trim().min(1),
  description: z.string().trim().min(1),
  categoryIds: z.array(z.string()).min(1),
  phone: z.string().trim().optional().default(''),
  email: z.string().trim().optional().default(''),
  website: z.string().trim().optional().default(''),
});

export type NewPlaceDraftFields = z.infer<typeof newPlaceDraftSchema>;

export const EMPTY_NEW_PLACE_FIELDS: NewPlaceDraftFields = {
  title: '',
  country: 'KE',
  town: '',
  description: '',
  categoryIds: [],
  phone: '',
  email: '',
  website: '',
};

export const isNewPlaceComplete = (fields: NewPlaceDraftFields) =>
  newPlaceDraftSchema.safeParse(fields).success;
