import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { fetchPlace } from '@/services/place';
import { ApiResponse } from '@/types/apiResponse';
import { Place } from '@/types/place';

import { ReservePageContent } from './ReservePageContent';

export async function generateMetadata({
  params,
}: {
  params: { placeId: string };
}): Promise<Metadata> {
  try {
    const response: ApiResponse = await fetchPlace(params.placeId);
    const place: Place | undefined = response.data;

    return place ? { title: `Tukai - Reserve at ${place.title}` } : { title: 'Tukai' };
  } catch {
    return { title: 'Tukai' };
  }
}

export default async function ReservePlacePage({ params }: { params: { placeId: string } }) {
  const placeResponse: ApiResponse = await fetchPlace(params.placeId);
  const place: Place | undefined = placeResponse.data;

  if (!place) {
    notFound();
  }

  return <ReservePageContent place={place} />;
}
