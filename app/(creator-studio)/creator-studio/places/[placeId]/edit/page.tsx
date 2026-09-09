import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { fetchPlace } from '@/services/place';
import { ApiResponse } from '@/types/apiResponse';
import { Place } from '@/types/place';

import { EditPlaceContent } from './EditPlaceContent';

export async function generateMetadata({
  params,
}: {
  params: { placeId: string };
}): Promise<Metadata> {
  try {
    const response: ApiResponse = await fetchPlace(params.placeId);
    const place: Place | undefined = response.data;

    return place ? { title: `Tukai - Edit ${place.title}` } : { title: 'Tukai' };
  } catch {
    return { title: 'Tukai' };
  }
}

export default async function EditPlacePage({ params }: { params: { placeId: string } }) {
  // The detail endpoint carries the photos, properties and social links the
  // form edits, so the whole form is seeded from this one request
  const response: ApiResponse = await fetchPlace(params.placeId);
  const place: Place | undefined = response.data;

  if (!place) {
    notFound();
  }

  return <EditPlaceContent place={place} />;
}
