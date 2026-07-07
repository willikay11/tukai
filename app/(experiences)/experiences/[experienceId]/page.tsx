import { cache } from 'react';

import type { Metadata } from 'next';

import sanitizeHtml from 'sanitize-html';

import { fetchExperience } from '@/services/experience';
import { ApiResponse } from '@/types/apiResponse';
import { Experience } from '@/types/experience';
import { Photo } from '@/types/photo';

import { ViewExperiencePageContent } from './ViewExperiencePageContent';

// Deduplicate the fetch between generateMetadata and the page render
const getExperience = cache(async (experienceId: string): Promise<Experience | null> => {
  try {
    const response: ApiResponse = await fetchExperience(experienceId);
    return response.data ?? null;
  } catch {
    return null;
  }
});

const getCoverPhoto = (experience: Experience): string | undefined =>
  experience.photos?.find((photo: Photo) => photo.isCover)?.photo ||
  experience.photos?.[0]?.photo;

const buildDescription = (experience: Experience): string => {
  // Descriptions are stored as HTML — strip to plain text for meta tags
  const plain = sanitizeHtml(experience.description || '', {
    allowedTags: [],
    allowedAttributes: {},
  })
    .replace(/\s+/g, ' ')
    .trim();
  return plain.length > 160 ? `${plain.slice(0, 157)}…` : plain;
};

// schema.org expects ISO 4217 currency codes
const normalizeCurrency = (currency: string | undefined): string =>
  !currency || currency.toLowerCase().startsWith('ksh') ? 'KES' : currency;

export async function generateMetadata({
  params,
}: {
  params: { experienceId: string };
}): Promise<Metadata> {
  const experience = await getExperience(params.experienceId);

  if (!experience) {
    return { title: 'Tukai' };
  }

  const title = `Tukai - ${experience.title}`;
  const description = buildDescription(experience);
  const coverPhoto = getCoverPhoto(experience);
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/experiences/${experience.id}`;

  return {
    title,
    description,
    keywords: experience.categories?.map((category) => category.name),
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: 'Tukai',
      type: 'website',
      locale: 'en_KE',
      images: coverPhoto ? [{ url: coverPhoto, alt: experience.title }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: coverPhoto ? [coverPhoto] : [],
    },
    robots: experience.isPublic ? undefined : { index: false, follow: false },
  };
}

const buildEventJsonLd = (experience: Experience) => {
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/experiences/${experience.id}`;
  const currency = normalizeCurrency(experience.currency);

  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: experience.title,
    description: buildDescription(experience),
    url,
    image: experience.photos?.map((photo: Photo) => photo.photo) ?? [],
    startDate: experience.startDate,
    endDate: experience.endDate,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: experience.location?.name || experience.location?.formattedAddress,
      address: {
        '@type': 'PostalAddress',
        streetAddress: experience.location?.street || undefined,
        addressLocality: experience.location?.city || undefined,
        addressRegion: experience.location?.state || undefined,
        addressCountry: experience.location?.country || undefined,
      },
    },
    ...(experience.hostCommunity || experience.host
      ? {
          organizer: {
            '@type': 'Organization',
            name: experience.hostCommunity?.title || experience.host?.displayName,
          },
        }
      : {}),
    ...(experience.isPaid && experience.tickets?.length
      ? {
          offers: experience.tickets.map((ticket) => ({
            '@type': 'Offer',
            name: ticket.name,
            price: typeof ticket.price === 'string' ? parseFloat(ticket.price) : ticket.price,
            priceCurrency: currency,
            availability: experience.isSoldOut
              ? 'https://schema.org/SoldOut'
              : 'https://schema.org/InStock',
            url,
          })),
        }
      : {}),
  };
};

export default async function ViewExperiencePage({ params }: { params: { experienceId: string } }) {
  const experience = await getExperience(params.experienceId);

  if (!experience) {
    return;
  }

  const jsonLd = buildEventJsonLd(experience);

  return (
    <>
      <script
        type="application/ld+json"
        // JSON-LD for search engine rich results; escape < to prevent script injection
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }}
      />
      <ViewExperiencePageContent experience={experience} />
    </>
  );
}
