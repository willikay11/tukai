import { Suspense } from 'react';

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { fetchPlace } from '@/services/place';
import { ApiResponse } from '@/types/apiResponse';
import { Place } from '@/types/place';

import { ManagePlaceContent } from './ManagePlaceContent';

export async function generateMetadata({
  params,
}: {
  params: { placeId: string };
}): Promise<Metadata> {
  try {
    const response: ApiResponse = await fetchPlace(params.placeId);
    const place: Place | undefined = response.data;

    return place ? { title: `Tukai - Manage ${place.title}` } : { title: 'Tukai' };
  } catch {
    return { title: 'Tukai' };
  }
}

export default async function ManagePlacePage({ params }: { params: { placeId: string } }) {
  const response: ApiResponse = await fetchPlace(params.placeId);
  const place: Place | undefined = response.data;

  if (!place) {
    notFound();
  }

  return (
    // The tab lives in the URL, so a link can open one directly
    <Suspense fallback={null}>
      <ManagePlaceContent place={place} />
    </Suspense>
  );
}
