import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { fetchPlace } from '@/services/place';
import { ApiResponse } from '@/types/apiResponse';
import { Place } from '@/types/place';

import { ReservationSettingsContent } from './ReservationSettingsContent';

export async function generateMetadata({
  params,
}: {
  params: { placeId: string };
}): Promise<Metadata> {
  try {
    const response: ApiResponse = await fetchPlace(params.placeId);
    const place: Place | undefined = response.data;

    return place ? { title: `Tukai - ${place.title} reservations` } : { title: 'Tukai' };
  } catch {
    return { title: 'Tukai' };
  }
}

export default async function ReservationSettingsPage({ params }: { params: { placeId: string } }) {
  const response: ApiResponse = await fetchPlace(params.placeId);
  const place: Place | undefined = response.data;

  if (!place) {
    notFound();
  }

  return <ReservationSettingsContent place={place} />;
}
