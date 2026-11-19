import { render, screen } from '@testing-library/react';

import { ReviewView } from './ReviewView';

jest.mock('@/app/shared/components/Icons', () => ({ IconComponent: () => null }));
jest.mock('@/app/shared/components/Images', () => ({
  PlainImage: ({ alt }: { alt?: string }) => <span>{alt}</span>,
}));
jest.mock('@/app/shared/components/Global', () => ({ OpenInMapsLink: () => null }));

const flowWith = (
  photos: { id: string; url: string; file?: File }[],
  about: Record<string, unknown> = {},
) => ({
  formData: {
    dateType: {
      experienceType: 'one-time',
      isRecurring: false,
      experiencePricing: 'free',
      date: '2099-01-10',
      startTime: '09:00',
      endTime: '11:00',
      timeSlots: [],
      recurringDays: [],
    },
    about: {
      title: 'Sunrise hike',
      description: 'Up the hill',
      location: 'Ngong Hills',
      placeId: null,
      photos,
      categories: [],
      visibility: 'public',
      whatsIncluded: '',
      whatsNotIncluded: '',
      ...about,
    },
    tickets: { items: [{ id: 't1', name: 'Free', quantity: 10, amount: 0 }] },
    invite: { invitedCommunities: [], invitedCommunityIds: [], invitedGuests: [] },
    wallet: { paymentMethod: 'phone', isAddingNew: false, phoneNumber: '' },
    itineraryDays: [],
  },
  hasSavedWallets: false,
  savedWallets: [],
  activeStep: 'tickets',
  previewExperience: undefined,
});

// DEV-510: Review showed local previews of photos that never uploaded, so
// they looked fine there
describe('ReviewView, photos', () => {
  it('asks for photos that are still only on this device', () => {
    const file = new File(['x'], 'hike.heic', { type: 'image/heic' });
    render(
      <ReviewView
        flow={flowWith([{ id: 'tmp', url: 'blob:hike', file }]) as never}
        onPublish={jest.fn()}
        isPublishing={false}
      />,
    );

    expect(screen.getByText(/Before you publish, add/).parentElement).toHaveTextContent(
      'the photos that have not uploaded yet (go back to About to add them)',
    );
  });

  it('says nothing about photos that are uploaded', () => {
    render(
      <ReviewView
        flow={flowWith([{ id: 'p1', url: 'https://cdn/hike.jpg' }]) as never}
        onPublish={jest.fn()}
        isPublishing={false}
      />,
    );

    expect(screen.queryByText(/not uploaded yet/)).not.toBeInTheDocument();
  });
});

// DEV-511: the fields hold the rich-text editor's HTML, which showed as text
describe("ReviewView, what's included", () => {
  it('shows each list item as its own row, with no tags', () => {
    render(
      <ReviewView
        flow={
          flowWith([], {
            whatsIncluded:
              '<ul class="m-0 p-0"><li value="1"><span style="white-space: pre-wrap;">A shared meal</span></li><li value="2"><span>Food &amp; drinks</span></li></ul>',
            whatsNotIncluded: '<p>Transport</p>',
          }) as never
        }
        onPublish={jest.fn()}
        isPublishing={false}
      />,
    );

    expect(screen.getByText('A shared meal')).toBeInTheDocument();
    expect(screen.getByText('Food & drinks')).toBeInTheDocument();
    expect(screen.getByText('Transport')).toBeInTheDocument();
    expect(screen.queryByText(/<ul|<li|<span/)).not.toBeInTheDocument();
  });
});
