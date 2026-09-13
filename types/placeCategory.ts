export type CategoryImage = {
  id: string;
  image?: string;
  imageUrl?: string;
  imageWebpThumbUrl?: string;
  order?: number;
};

export type PlaceCategory = {
  id: string;
  name: string;
  icon: string;
  group: string;
  placesCount: number;
  // The API returns an array (`images`), not a single `image` — the first one
  // is what the city cards show
  images?: CategoryImage[];
};

/** The image a category card shows: the first one the API returned. */
export const categoryImageOf = (category: PlaceCategory): string | null => {
  const first = category.images?.[0];
  return first?.imageUrl || first?.image || null;
};
