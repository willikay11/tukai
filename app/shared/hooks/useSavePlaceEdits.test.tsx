import React from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';

import { PlaceEditDraft } from '@/types/placeEdit';

import { useSavePlaceEdits } from './usePlaces';

const calls: string[] = [];
const uploadPlacePhoto = jest.fn();
const reorderPlacePhotos = jest.fn();
const deletePlacePhoto = jest.fn();

jest.mock('@/services/place', () => ({
  updatePlace: jest.fn(),
  deletePlacePhoto: (...args: unknown[]) => {
    calls.push('delete');
    return deletePlacePhoto(...args);
  },
  uploadPlacePhoto: (...args: unknown[]) => {
    calls.push('upload');
    return uploadPlacePhoto(...args);
  },
  reorderPlacePhotos: (...args: unknown[]) => {
    calls.push('reorder');
    return reorderPlacePhotos(...args);
  },
  deletePlaceProperty: jest.fn(),
  updatePlaceProperty: jest.fn(),
  createPlaceProperty: jest.fn(),
  deletePlaceSocialLink: jest.fn(),
  updatePlaceSocialLink: jest.fn(),
  createPlaceSocialLink: jest.fn(),
}));
jest.mock('@/app/shared/hooks/useCommunities', () => ({ useGetCommunities: () => ({}) }));
jest.mock('next-auth/react', () => ({ useSession: () => ({ data: null }) }));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider
    client={new QueryClient({ defaultOptions: { mutations: { retry: false } } })}
  >
    {children}
  </QueryClientProvider>
);

const save = async (draft: PlaceEditDraft) => {
  const { result } = renderHook(() => useSavePlaceEdits('pl1'), { wrapper });
  await act(async () => {
    await result.current.mutateAsync(draft).catch(() => undefined);
  });
};

const file = (name: string) => new File(['x'], name, { type: 'image/jpeg' });

// DEV-390: the photos' order is saved, first one the cover
describe('useSavePlaceEdits, photo order', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    calls.length = 0;
    reorderPlacePhotos.mockResolvedValue({});
  });

  it('saves a new order of the photos already there', async () => {
    await save({ photos: { added: [], removedIds: [], order: ['ph2', 'ph1', 'ph3'] } });

    expect(reorderPlacePhotos).toHaveBeenCalledWith('pl1', ['ph2', 'ph1', 'ph3']);
    expect(uploadPlacePhoto).not.toHaveBeenCalled();
  });

  it('puts a new photo where it was dropped, under the id its upload gave it', async () => {
    uploadPlacePhoto.mockResolvedValue({ data: { id: 'ph-new' } });

    await save({
      photos: {
        added: [{ localId: 'temp-1', file: file('a.jpg'), order: 0 }],
        removedIds: ['ph3'],
        order: ['temp-1', 'ph1', 'ph2'],
      },
    });

    expect(calls).toEqual(['delete', 'upload', 'reorder']);
    expect(reorderPlacePhotos).toHaveBeenCalledWith('pl1', ['ph-new', 'ph1', 'ph2']);
  });

  it('leaves out a new photo whose upload gave no id', async () => {
    uploadPlacePhoto.mockResolvedValue({ data: {} });

    await save({
      photos: {
        added: [{ localId: 'temp-1', file: file('a.jpg') }],
        removedIds: [],
        order: ['ph1', 'temp-1'],
      },
    });

    expect(reorderPlacePhotos).toHaveBeenCalledWith('pl1', ['ph1']);
  });

  it('sends no order when it did not move', async () => {
    await save({ photos: { added: [], removedIds: ['ph3'] } });

    expect(reorderPlacePhotos).not.toHaveBeenCalled();
  });
});
