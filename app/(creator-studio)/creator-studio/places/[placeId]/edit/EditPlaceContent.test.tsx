import React from 'react';

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Place } from '@/types/place';

import { EditPlaceContent } from './EditPlaceContent';

const push = jest.fn();
jest.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));

const toast = jest.fn();
jest.mock('@/app/shared/hooks/useToast', () => ({ useToast: () => ({ toast }) }));

const save = jest.fn();
let isManager = true;
jest.mock('@/app/shared/hooks/usePlaces', () => ({
  usePlaceManager: () => ({ isManager, isLoading: false }),
  useSavePlaceEdits: () => ({ mutate: save, isPending: false }),
  useGoogleMapsAutocomplete: () => ({ data: { data: [] }, isFetching: false }),
}));

// Lexical needs a real DOM range API jsdom does not give it, and what matters
// here is the value it reports, not how it renders
jest.mock('@/components/blocks/editor-00/editor', () => ({
  Editor: ({
    initialHtml,
    onHtmlChange,
  }: {
    initialHtml?: string;
    onHtmlChange?: (html: string) => void;
  }) => (
    <textarea
      aria-label="Description"
      defaultValue={initialHtml}
      onChange={(event) => onHtmlChange?.(event.target.value)}
    />
  ),
}));

const place = (extra: Partial<Place> = {}): Place =>
  ({
    id: 'p1',
    slug: 'kraftory',
    title: 'Kraftory Biergarten',
    description: '<p>A garden</p>',
    location: { formattedAddress: '89 Ruaka Rd, Nairobi' },
    photos: [{ id: 'ph1', photo: 'https://cdn.test/1.jpg', isCover: true }],
    properties: [{ id: 'pr1', key: 'Opening hours', value: 'Mon-Sun' }],
    socialLinks: [{ id: 'sl1', platformName: 'Instagram', url: 'https://instagram.com/kraftory' }],
    ...extra,
  }) as Place;

const renderEdit = (value: Place = place()) => render(<EditPlaceContent place={value} />);

// jsdom ships neither object URLs nor image decoding, both of which the photo
// field leans on to preview and size what was picked
beforeAll(() => {
  URL.createObjectURL = jest.fn(() => 'blob:preview');
  URL.revokeObjectURL = jest.fn();

  Object.defineProperty(window.Image.prototype, 'src', {
    set() {
      setTimeout(() => this.onload?.());
    },
  });
  Object.defineProperty(window.Image.prototype, 'width', { get: () => 800 });
  Object.defineProperty(window.Image.prototype, 'height', { get: () => 800 });
});

describe('EditPlaceContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    save.mockReset();
    isManager = true;
  });

  it('opens on About with the place already filled in', () => {
    renderEdit();

    expect(screen.getByRole('heading', { name: 'Edit Place' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /About/ })).toHaveAttribute('data-state', 'active');
    expect(screen.getByLabelText('Name')).toHaveValue('Kraftory Biergarten');
    expect(screen.getByLabelText('Description')).toHaveValue('<p>A garden</p>');
    expect(screen.getByPlaceholderText('Select a city or place')).toHaveValue(
      '89 Ruaka Rd, Nairobi',
    );
  });

  it('carries the three steps', () => {
    renderEdit();

    ['About', 'Properties', 'Social Links'].forEach((label) =>
      expect(screen.getByRole('tab', { name: new RegExp(label) })).toBeInTheDocument(),
    );
  });

  // Ownership is the whole basis of the screen
  it('turns away anyone who does not manage the place', () => {
    isManager = false;

    renderEdit();

    expect(screen.queryByRole('heading', { name: 'Edit Place' })).not.toBeInTheDocument();
    expect(screen.getByText(/Only the community that owns/)).toBeInTheDocument();
  });

  // Four endpoints back this form, so an untouched part must send nothing
  it('sends only what actually changed', async () => {
    const user = userEvent.setup();
    renderEdit();

    await user.clear(screen.getByLabelText('Name'));
    await user.type(screen.getByLabelText('Name'), 'Kraftory');
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    await waitFor(() => expect(save).toHaveBeenCalled());

    const [draft] = save.mock.calls[0];
    expect(draft.about.title).toBe('Kraftory');
    expect(draft.photos).toBeUndefined();
    expect(draft.properties).toBeUndefined();
    expect(draft.socialLinks).toBeUndefined();
  });

  // A toast slides away while the reader is still reading it
  it('confirms a save with the modal the rest of the app uses', async () => {
    const user = userEvent.setup();
    save.mockImplementation((_draft, options) => options?.onSuccess?.());
    renderEdit();

    await user.clear(screen.getByLabelText('Name'));
    await user.type(screen.getByLabelText('Name'), 'Kraftory');
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(await screen.findByText('Changes Saved Successfully!')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'View place' })).toHaveAttribute(
      'href',
      '/places/kraftory',
    );
    // Nowhere yet — the reader is still looking at the confirmation
    expect(push).not.toHaveBeenCalled();
  });

  it('lands back on the manage page once the confirmation is dismissed', async () => {
    const user = userEvent.setup();
    save.mockImplementation((_draft, options) => options?.onSuccess?.());
    renderEdit();

    await user.clear(screen.getByLabelText('Name'));
    await user.type(screen.getByLabelText('Name'), 'Kraftory');
    await user.click(screen.getByRole('button', { name: 'Save changes' }));
    await screen.findByText('Changes Saved Successfully!');
    await user.keyboard('{Escape}');

    expect(push).toHaveBeenCalledWith('/creator-studio/places/p1');
  });

  it('says so rather than calling the API when nothing was touched', async () => {
    const user = userEvent.setup();
    renderEdit();

    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(save).not.toHaveBeenCalled();
    expect(toast).toHaveBeenCalledWith(expect.objectContaining({ title: 'Nothing to save' }));
  });

  // The API keys a place's location off the Google id, so a typed-over address
  // would save as nothing at all
  it('refuses an address that was typed rather than picked', async () => {
    const user = userEvent.setup();
    renderEdit();

    await user.type(screen.getByPlaceholderText('Select a city or place'), ' extra');
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(save).not.toHaveBeenCalled();
    expect(screen.getByText('Pick the address from the suggestions')).toBeInTheDocument();
  });

  it('opens the step holding the problem', async () => {
    const user = userEvent.setup();
    renderEdit();

    await user.click(screen.getByRole('tab', { name: /Social Links/ }));
    await user.click(screen.getByRole('button', { name: /Add social link/ }));
    await user.type(screen.getByLabelText('Link 2 platform'), 'TikTok');
    await user.type(screen.getByLabelText('Link 2 URL'), 'tiktok.com/kraftory');

    await user.click(screen.getByRole('tab', { name: /About/ }));
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(save).not.toHaveBeenCalled();
    await waitFor(() =>
      expect(screen.getByRole('tab', { name: /Social Links/ })).toHaveAttribute(
        'data-state',
        'active',
      ),
    );
    expect(screen.getByText(/Enter a full link/)).toBeInTheDocument();
  });

  // A place has no free/paid column, so the pill edits the property of that
  // name — the same row the Properties step lists
  it('saves free or paid entry as a property', async () => {
    const user = userEvent.setup();
    renderEdit();

    await user.click(screen.getByRole('button', { name: 'Paid Entry' }));
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    await waitFor(() => expect(save).toHaveBeenCalled());

    const [draft] = save.mock.calls[0];
    expect(draft.properties.added).toEqual([
      expect.objectContaining({ key: 'Entry', value: 'Paid entry' }),
    ]);
  });

  it('reads an existing entry property back into the pills', () => {
    renderEdit(
      place({
        properties: [{ id: 'pr9', key: 'Entry', value: 'Paid entry' }],
      }),
    );

    expect(screen.getByRole('button', { name: 'Paid Entry' })).toHaveClass('text-white');
  });

  it('marks a removed photo for deletion and a picked one for upload', async () => {
    const user = userEvent.setup();
    renderEdit();

    await user.click(screen.getByRole('button', { name: 'Remove photo' }));
    await user.upload(
      screen.getByLabelText('Add photos'),
      new File(['x'], 'new.png', { type: 'image/png' }),
    );

    await waitFor(() => expect(screen.getByRole('button', { name: 'Remove photo' })).toBeVisible());

    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    await waitFor(() => expect(save).toHaveBeenCalled());

    const [draft] = save.mock.calls[0];
    expect(draft.photos.removedIds).toEqual(['ph1']);
    expect(draft.photos.added).toHaveLength(1);
    // Nothing of the original is left, so the replacement becomes the cover
    expect(draft.photos.added[0].isCover).toBe(true);
  });
});
