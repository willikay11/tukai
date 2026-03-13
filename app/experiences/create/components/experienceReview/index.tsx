'use client';

import sanitizeHtml from 'sanitize-html';

import IconComponent from '@/app/components/iconComponent';
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
  experience?: Experience;
  invitedMembers?: InvitedMember[];
  invitedCommunities?: Community[];
}

export default function ExperienceReview({
  experience,
  invitedMembers = [],
  invitedCommunities = [],
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

  return (
    <div className="h-full overflow-y-auto">
      <p className="mb-1 text-xs text-gray-500">Experience Preview</p>
      <h2 className="text-xl font-semibold text-gray-900">{experience.title}</h2>

      {/* Photo Gallery */}
      <ReviewPhotoGallery photos={experience.photos} />

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
      />

      {/* What's NOT Included */}
      <ReviewInfoSection
        title="What's NOT included"
        description={
          '<ul><li>International air transportation to and from Nairobi.</li><li>All other expenses of personal nature such as visas, travel/baggage insurance, laundry, beverages, tips, etc.</li><li>Any optional services listed as optional in the safari program.</li></ul>'
        }
        variant="excluded"
      />

      <div className="mt-6 rounded-[12px] border-[1px] border-gray-200 bg-gray-100 p-5">
        {/* Location of the Experience */}
        <ReviewLocationCard
          title="Location of the Experience"
          location={experience.location}
          showTime={false}
        />

        {/* Meeting/Pick-up Point & Time */}
        <div className="mt-6">
          <ReviewLocationCard
            title="Meeting/Pick-up Point & Time"
            location={experience.location}
            startDate={experience.startDate}
            endDate={experience.endDate}
            showTime
          />
        </div>
      </div>

      {/* Categories */}
      <ReviewCategories categories={experience.categories} />

      {/* Experience Type */}
      <div className="mt-6">
        <h3 className="text-base font-semibold text-gray-700">Experience Type</h3>
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
      <ReviewTickets tickets={experience.tickets} coverPhoto={coverPhoto} />

      {/* Guests */}
      <ReviewGuests guests={mergedGuests} />

      {/* Invited Communities */}
      <ReviewCommunities communities={invitedCommunities} />
    </div>
  );
}
