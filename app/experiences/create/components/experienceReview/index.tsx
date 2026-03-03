'use client';

import { Experience } from '@/types/experience';

import ReviewCategories from './reviewCategories';
import ReviewCommunities from './reviewCommunities';
import ReviewGuests from './reviewGuests';
import ReviewInfoSection from './reviewInfoSection';
import ReviewLocationCard from './reviewLocationCard';
import ReviewPhotoGallery from './reviewPhotoGallery';
import ReviewTickets from './reviewTickets';

export interface ExperienceReviewProps {
  experience?: Experience;
}

export default function ExperienceReview({ experience }: ExperienceReviewProps) {
  if (!experience) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-gray-500">
        No experience data available
      </div>
    );
  }

  const coverPhoto =
    experience.photos?.find((p) => p.isCover)?.photo || experience.photos?.[0]?.photo;

  return (
    <div className="h-full overflow-y-auto">
      <p className="mb-1 text-xs text-gray-500">Experience Preview</p>
      <h2 className="text-xl font-semibold text-gray-900">{experience.title}</h2>

      {/* Photo Gallery */}
      <ReviewPhotoGallery photos={experience.photos} />

      {/* Description */}
      <p className="mt-4 text-xs leading-relaxed text-gray-700">{experience.description}</p>

      {/* What's Included */}
      <ReviewInfoSection
        title="What's included"
        items={[
          'Transportation in a 4X4 safari cruiser.',
          'Services of a trained and experienced English-speaking driver/guide',
          'Full Board accommodation in all lodges and luxury camps',
          'Bottled drinking water for use during the safari',
          'Game drives, as mentioned',
          'All taxes plus Park entry fees',
        ]}
        variant="included"
      />

      {/* What's NOT Included */}
      <ReviewInfoSection
        title="What's NOT included"
        items={[
          'International air transportation to and from Nairobi.',
          'All other expenses of personal nature such as visas, travel/baggage insurance, laundry, beverages, tips, etc.',
          'Any optional services listed as optional in the safari program.',
        ]}
        variant="excluded"
      />

      {/* Location of the Experience */}
      <ReviewLocationCard
        title="Location of the Experience"
        location={experience.location}
        showTime={false}
      />

      {/* Meeting/Pick-up Point & Time */}
      <ReviewLocationCard
        title="Meeting/Pick-up Point & Time"
        location={experience.location}
        startDate={experience.startDate}
        endDate={experience.endDate}
        showTime
      />

      {/* Categories */}
      <ReviewCategories categories={experience.categories} />

      {/* Experience Type */}
      <div className="mt-6">
        <h3 className="text-sm font-semibold text-gray-900">Experience Type</h3>
        <div className="mt-2 flex items-center gap-2 text-xs text-gray-700">
          <span className="text-gray-400">🔒</span>
          <span>{experience.isPublic ? 'Public' : 'Private'}</span>
          <span className="text-gray-400">
            {experience.isPublic ? '(Anyone can join)' : '(Only invited guests can join)'}
          </span>
        </div>
      </div>

      {/* Tickets */}
      <ReviewTickets tickets={experience.tickets} coverPhoto={coverPhoto} />

      {/* Guests */}
      <ReviewGuests guests={experience.coHosts} />

      {/* Invited Communities */}
      <ReviewCommunities />
    </div>
  );
}
