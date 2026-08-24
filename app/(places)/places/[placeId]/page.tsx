import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { fetchPlace } from '@/services/place';
import { ApiResponse } from '@/types/apiResponse';
import { Place } from '@/types/place';

import { PlaceDetailContent } from './components/PlaceDetailContent';

export async function generateMetadata({
  params,
}: {
  params: { placeId: string };
}): Promise<Metadata> {
  try {
    const response: ApiResponse = await fetchPlace(params.placeId);
    const place: Place | undefined = response.data;

    return place ? { title: `Tukai - ${place.title}` } : { title: 'Tukai' };
  } catch {
    return { title: 'Tukai' };
  }
}

export default async function ViewPlacePage({ params }: { params: { placeId: string } }) {
  // The detail response embeds `properties` and `social_links`, so the separate
  // /properties and /social-links calls this page used to make were redundant —
  // and both hit paths without a trailing slash, costing a 301 each.
  const placeResponse: ApiResponse = await fetchPlace(params.placeId);
  const place: Place | undefined = placeResponse.data;

  // Previously returned undefined, which renders blank rather than the
  // not-found route
  if (!place) {
    notFound();
  }

  return <PlaceDetailContent place={place} />;
}
