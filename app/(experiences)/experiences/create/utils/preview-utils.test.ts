import { FormData } from '../hooks/useCreateExperienceFlow';
import { buildPreviewExperience } from './preview-utils';

const formData = (aboutOverrides: Record<string, unknown> = {}): FormData =>
  ({
    dateType: {
      community: null,
      experiencePricing: 'paid',
      experienceType: 'one-time',
      isRecurring: false,
      date: '2026-09-01',
      startTime: '08:00',
      endTime: '17:00',
      recurringDays: [],
      recurrenceStartDate: null,
      recurrenceEndDate: null,
      timeSlots: [],
      multiDayStartDate: null,
      multiDayStartTime: null,
      multiDayEndDate: null,
      multiDayEndTime: null,
      itineraryStartDate: null,
      itineraryEndDate: null,
    },
    about: {
      photos: [],
      title: 'Ngong Hills',
      visibility: 'public',
      description: 'A trek',
      whatsIncluded: '',
      whatsNotIncluded: '',
      location: 'Ngong Hills, Nairobi',
      locationPlaceId: '',
      placeId: null,
      placeImageUrl: null,
      meetingPoint: '',
      meetingTime: null,
      categories: [],
      ...aboutOverrides,
    },
    tickets: { commission: 'host', ticketMode: null, items: [] },
    invite: { invitedGuests: [], invitedCommunityIds: [], invitedCommunities: [] },
    wallet: { paymentMethod: 'phone', phoneNumber: '' },
    itineraryDays: [],
  }) as unknown as FormData;

describe('buildPreviewExperience — location', () => {
  // The map renders from point.coordinates; without them the detail view shows
  // "Waiting for location..." in the preview while the published page works
  it('carries coordinates through to the preview location', () => {
    const experience = buildPreviewExperience(formData(), {
      geocodedLocation: {
        city: 'Nairobi',
        country: 'Kenya',
        pointLat: -1.4,
        pointLong: 36.65,
        point: { type: 'Point', coordinates: [36.65, -1.4] },
      },
    });

    expect(experience.location.point.coordinates).toEqual([36.65, -1.4]);
    expect(experience.location.city).toBe('Nairobi');
  });

  it('falls back to the typed address when nothing resolved', () => {
    const experience = buildPreviewExperience(formData(), { geocodedLocation: null });

    expect(experience.location.name).toBe('Ngong Hills, Nairobi');
    expect(experience.location.point).toBeUndefined();
  });

  it('keeps the google place id when the location came from a Google pick', () => {
    const experience = buildPreviewExperience(formData({ locationPlaceId: 'gp-1' }), {});

    expect(experience.location.googleMapPlaceId).toBe('gp-1');
  });
});
