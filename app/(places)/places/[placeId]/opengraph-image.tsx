import { OG_CONTENT_TYPE, OG_SIZE, fetchOgSubject, renderOgCard } from '@/utils/og-card';

export const runtime = 'edge';
export const alt = 'Tukai';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

// Next's opengraph-image convention requires a default export, as page.tsx does
// eslint-disable-next-line import/no-default-export
export default async function Image({ params }: { params: { placeId: string } }) {
  const { title, photo } = await fetchOgSubject(`/v1/places/${params.placeId}/`);

  return renderOgCard({ title: title ?? 'Tukai', photo });
}
