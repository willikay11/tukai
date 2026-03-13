'use client';

import { useState } from 'react';

import sanitizeHtml from 'sanitize-html';

import IconComponent from '@/app/components/iconComponent';
import ImageCarousel from '@/components/ui/imageCarousel';
import { InvitedMember } from '@/components/ui/invite-members';
import { Community } from '@/types/community';
import { Experience } from '@/types/experience';
import { User } from '@/types/user';

import ReviewCategories from './reviewCategories';
import ReviewCommunities from './reviewCommunities';
import ReviewGuests from './reviewGuests';
import ReviewInfoSection from './reviewInfoSection';
import ReviewLocationCard from './reviewLocationCard';
import ReviewPhotoGallery from './reviewPhotoGallery';
import ReviewTickets from './reviewTickets';

export interface ExperienceReviewProps {
  type?: 'create' | 'review';
  experience?: Experience;
  invitedMembers?: InvitedMember[];
  invitedCommunities?: Community[];
  onEditRequest?: (section: 'about' | 'dates' | 'tickets' | 'invites') => void;
}

export default function ExperienceReview({
  type = 'create',
  experience,
  invitedMembers = [],
  invitedCommunities = [],
  onEditRequest,
}: ExperienceReviewProps) {
  if (!experience) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-gray-500">
        No experience data available
      </div>
    );
  }

  const coverPhoto =
    experience.photos?.find((p) => p.isCover)?.photo || experience.photos?.[0]?.photo;

  const invitedMembersAsUsers: User[] = invitedMembers.map((member) => {
    const [firstName = '', ...rest] = (member.name || '').trim().split(' ');
    const lastName = rest.join(' ');

    return {
      id: member.id,
      firstName,
      lastName,
      displayName: member.name,
      picture: member.image || '',
      email: member.email,
    };
  });

  const mergedGuests = [...invitedMembersAsUsers];
  for (const guest of experience.coHosts || []) {
    if (!mergedGuests.some((member) => member.id === guest.id)) {
      mergedGuests.push(guest);
    }
  }

  const openEditAbout = () => {
    if (onEditRequest) {
      onEditRequest('about');
    }
  };

  const openEditTickets = () => {
    if (onEditRequest) {
      onEditRequest('tickets');
    }
  };

  const openEditDates = () => {
    if (onEditRequest) {
      onEditRequest('dates');
    }
  }

  const openEditInvites = () => {
    if (onEditRequest) {
      onEditRequest('invites');
    }
  };

  return (
    <div className="h-full overflow-y-auto">
      {type === 'create' ? (
        <>
          <p className="mb-1 text-xs text-gray-500">Experience Preview</p>
        </>
      ) : (
        <>
          <p className="mb-2 text-xl font-bold text-gray-800">Review Experience</p>
          <p className="mb-2.5 text-xs text-gray-900">
            Please review your experience details before publishing.
          </p>
        </>
      )}
      {type === 'create' && (
        <h2 className="text-xl font-semibold text-gray-900">{experience.title}</h2>
      )}

      {/* Photo Gallery */}
      {type === 'create' ? (
        <>
          <h2 className="text-xl font-semibold text-gray-900">{experience.title}</h2>
          <ReviewPhotoGallery photos={experience.photos} />
        </>
      ) : (
        <>
          <div className="relative">
            <ImageCarousel
              className="h-[20.25rem]"
              images={experience.photos
                .sort((a, b) => (b.isCover ? 1 : 0) - (a.isCover ? 1 : 0))
                .map((photo) => photo.photo)}
            />
            <button
              type="button"
              onClick={openEditAbout}
              className="absolute right-3 bottom-3"
              aria-label="Edit photos"
            >
              <IconComponent iconName="Edit02Icon" size={16} className="text-white" />
            </button>
          </div>
          <div className="flex flex-row justify-between items-end">
            <h2 className="mt-4 text-xl font-semibold text-gray-900">{experience.title}</h2>
            <button
              type="button"
              onClick={openEditAbout}
              className="text-gray-400 transition-colors hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
              aria-label={`Edit ${experience.title}`}
            >
              <IconComponent iconName="Edit02Icon" size={16} className="text-primary" />
            </button>
          </div>
        </>
      )}

      {/* Description */}
      <div
        className="mt-4 text-xs leading-relaxed text-gray-700"
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(experience.description || '') }}
      />

      {/* What's Included */}
      <ReviewInfoSection
        title="What's included"
        description={
          '<ul><li>Transportation in a 4X4 safari cruiser.</li><li>Services of a trained and experienced English-speaking driver/guide</li><li>Full Board accommodation in all lodges and luxury camps</li><li>Bottled drinking water for use during the safari</li><li>Game drives, as mentioned</li><li>All taxes plus Park entry fees</li></ul>'
        }
        variant="included"
        editable={type === 'review'}
        onEdit={openEditAbout}
      />

      {/* What's NOT Included */}
      <ReviewInfoSection
        title="What's NOT included"
        description={
          '<ul><li>International air transportation to and from Nairobi.</li><li>All other expenses of personal nature such as visas, travel/baggage insurance, laundry, beverages, tips, etc.</li><li>Any optional services listed as optional in the safari program.</li></ul>'
        }
        variant="excluded"
        editable={type === 'review'}
        onEdit={openEditAbout}
      />

      <div className="mt-6 rounded-[12px] border-[1px] border-gray-200 bg-gray-100 p-5">
        {/* Location of the Experience */}
        <ReviewLocationCard
          title="Location of the Experience"
          location={experience.location}
          showTime={false}
          editable={type === 'review'}
          onEdit={openEditAbout}
        />

        {/* Meeting/Pick-up Point & Time */}
        <div className="mt-6">
          <ReviewLocationCard
            title="Meeting/Pick-up Point & Time"
            location={experience.location}
            startDate={experience.startDate}
            endDate={experience.endDate}
            showTime
            editable={type === 'review'}
            onEdit={openEditAbout}
          />
        </div>
      </div>

      {/* Categories */}
      <ReviewCategories
        categories={experience.categories}
        editable={type === 'review'}
        onEdit={openEditAbout}
      />

      {/* Experience Type */}
      <div className="mt-6">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-base font-semibold text-gray-700">Experience Type</h3>
          <button
            type="button"
            onClick={openEditDates}
            disabled={type !== 'review'}
            className="text-gray-400 transition-colors hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Edit Experience Type"
          >
            <IconComponent iconName="Edit02Icon" size={16} className='text-primary' />
          </button>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <div className="flex items-end gap-1">
            <IconComponent iconName="UserRemoveIcon" size={18} color="#1F2937" />
          </div>
          <span className="text-xs font-medium text-gray-800">
            {experience.isPublic ? 'Public' : 'Private'}
          </span>
          <span className="text-xs text-gray-500">
            {experience.isPublic ? '(Anyone can join)' : '(Only invited guests can join)'}
          </span>
        </div>
      </div>

      {/* Tickets */}
      <ReviewTickets
        tickets={experience.tickets}
        coverPhoto={coverPhoto}
        editable={type === 'review'}
        onEdit={openEditTickets}
      />

      {/* Guests */}
      <ReviewGuests guests={mergedGuests} editable={type === 'review'} onEdit={openEditInvites} />

      {/* Invited Communities */}
      <ReviewCommunities
        communities={invitedCommunities}
        editable={type === 'review'}
        onEdit={openEditInvites}
      />
    </div>
  );
}
