import React from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { CreateCommunityDrawer } from './index';

const createCommunity = jest.fn();
const mockPush = jest.fn();

jest.mock('next/navigation', () => ({ useRouter: () => ({ push: mockPush }) }));

jest.mock('@/context/LocationContext', () => ({
  useLocation: () => ({
    city: 'Nairobi',
    area: 'Westlands, Nairobi',
    lat: -1.283,
    lng: 36.817,
    placeId: 'place-123',
  }),
}));

jest.mock('@/app/shared/hooks/useAuth', () => ({
  useGetInterestCategories: () => ({
    data: [
      { id: 'cat-1', name: 'Hiking', icon: 'HikingIcon' },
      { id: 'cat-2', name: 'Running', icon: 'WorkoutRunIcon' },
    ],
  }),
  useGetUsers: () => ({ data: [], isFetching: false }),
}));

jest.mock('@/app/shared/hooks/useCommunities', () => ({
  useCreateCommunity: () => ({ mutate: createCommunity, isPending: false }),
  useGetCommunities: () => ({ data: { data: { results: [] } }, isFetching: false }),
}));

describe('CreateCommunityDrawer', () => {
  beforeEach(() => jest.clearAllMocks());

  it('keeps Create community disabled until a name is entered', async () => {
    const user = userEvent.setup();
    render(<CreateCommunityDrawer open onOpenChange={jest.fn()} />);

    const submit = screen.getByRole('button', { name: 'Create community' });
    expect(submit).toBeDisabled();

    await user.type(screen.getByPlaceholderText('Add a name'), 'Nairobi Trail Runners');
    expect(submit).toBeEnabled();
  });

  it('defaults to public and sends the trimmed name, description and categories', async () => {
    const user = userEvent.setup();
    render(<CreateCommunityDrawer open onOpenChange={jest.fn()} />);

    await user.type(screen.getByPlaceholderText('Add a name'), '  Nairobi Trail Runners  ');
    await user.type(
      screen.getByPlaceholderText(/What brings your members together/),
      '  Weekend trail runs  ',
    );
    await user.click(screen.getByRole('button', { name: /Hiking/ }));
    await user.click(screen.getByRole('button', { name: 'Create community' }));

    expect(createCommunity).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Nairobi Trail Runners',
        description: 'Weekend trail runs',
        isPublic: true,
        categoriesIds: ['cat-1'],
        googleMapPlaceId: 'place-123',
      }),
      expect.any(Object),
    );
  });

  it('switches to Private when that pill is chosen', async () => {
    const user = userEvent.setup();
    render(<CreateCommunityDrawer open onOpenChange={jest.fn()} />);

    await user.type(screen.getByPlaceholderText('Add a name'), 'Private Circle');
    await user.click(screen.getByRole('radio', { name: /Private/ }));
    await user.click(screen.getByRole('button', { name: 'Create community' }));

    expect(createCommunity).toHaveBeenCalledWith(
      expect.objectContaining({ isPublic: false }),
      expect.any(Object),
    );
  });

  it('pushes to the new community once creation succeeds', async () => {
    const user = userEvent.setup();
    const onOpenChange = jest.fn();
    createCommunity.mockImplementation((_payload, { onSuccess }) =>
      onSuccess({ data: { id: 'c1', slug: 'nairobi-trail-runners' } }),
    );

    render(<CreateCommunityDrawer open onOpenChange={onOpenChange} />);

    await user.type(screen.getByPlaceholderText('Add a name'), 'Nairobi Trail Runners');
    await user.click(screen.getByRole('button', { name: 'Create community' }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(mockPush).toHaveBeenCalledWith('/communities/nairobi-trail-runners');
  });

  it('switches to the preview view and back', async () => {
    const user = userEvent.setup();
    render(<CreateCommunityDrawer open onOpenChange={jest.fn()} />);

    await user.type(screen.getByPlaceholderText('Add a name'), 'Nairobi Trail Runners');
    await user.click(screen.getByRole('button', { name: /Preview/ }));

    expect(screen.getByRole('heading', { name: 'Preview community' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Nairobi Trail Runners' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Back' }));

    expect(screen.getByRole('heading', { name: 'Create community' })).toBeInTheDocument();
  });

  it('discards the draft and closes when Cancel is pressed', async () => {
    const user = userEvent.setup();
    const onOpenChange = jest.fn();
    render(<CreateCommunityDrawer open onOpenChange={onOpenChange} />);

    await user.type(screen.getByPlaceholderText('Add a name'), 'Nairobi Trail Runners');
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(createCommunity).not.toHaveBeenCalled();
  });
});
