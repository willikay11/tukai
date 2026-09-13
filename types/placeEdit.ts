import { PlacePropertyPayload, PlaceSocialLinkPayload } from '@/services/place';

/**
 * What the edit screen sends when it saves.
 *
 * Every part is optional and every list only holds what changed: the screen
 * diffs its form against the place it loaded, so an untouched tab sends
 * nothing at all.
 */
export type PlaceEditDraft = {
  about?: {
    title?: string;
    description?: string;
    googleMapPlaceId?: string;
    categoriesIds?: string[];
  };
  photos?: {
    added: { file: File; isCover?: boolean; order?: number }[];
    removedIds: string[];
  };
  properties?: {
    added: PlacePropertyPayload[];
    updated: { id: string; data: PlacePropertyPayload }[];
    removedIds: string[];
  };
  socialLinks?: {
    added: PlaceSocialLinkPayload[];
    updated: { id: string; data: PlaceSocialLinkPayload }[];
    removedIds: string[];
  };
};
