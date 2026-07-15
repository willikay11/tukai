import { ApiResponse } from '@/types/apiResponse';
import { BucketList, CreateBucketListPayload } from '@/types/bucket-list';

/**
 * ⚠️ MOCK SERVICE — the bucket-list API does not exist yet (all candidate
 * endpoints 404 on staging as of 2026-07-14). Every function below returns
 * in-memory data shaped like the real service layer (ApiResponse + camelCase)
 * so the UI, hooks, and types are ready.
 *
 * TODO(backend): replace each mock body with the real call, e.g.
 *   const axiosInstance = await apiWithToken();
 *   const response = await axiosInstance.get(`/v1/bucket-lists/`);
 *   return { status: response.status, success: true, data: parseSnakeToCamel(response.data) };
 */

const MOCK_LATENCY_MS = 400;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const mockMembers = [
  { id: 'member-1', name: 'Tony Ouma', picture: null },
  { id: 'member-2', name: 'Wanjiku Kamau', picture: null },
  { id: 'member-3', name: 'Brian Otieno', picture: null },
  { id: 'member-4', name: 'Achieng Odhiambo', picture: null },
];

// Module-level store so create/join survive React Query refetches within a session
const myBucketLists: BucketList[] = [
  {
    id: 'bucket-1',
    title: 'Weekend Hikes',
    isPublic: true,
    coverPhoto: '/images/kilimanjaro.webp',
    savedCount: 12,
    previewPhotos: ['/images/one.jpg', '/images/two.jpg', '/images/three.jpg', '/images/four.jpg'],
    members: mockMembers.slice(0, 3),
    owner: { id: 'me', name: 'You' },
    isOwner: true,
    hasJoined: true,
  },
  {
    id: 'bucket-2',
    title: 'Coast Getaways',
    isPublic: false,
    coverPhoto: '/images/infinite-pool.webp',
    savedCount: 3,
    previewPhotos: ['/images/five.jpg', '/images/seven.jpg', '/images/eight.jpg'],
    members: mockMembers.slice(0, 2),
    owner: { id: 'me', name: 'You' },
    isOwner: true,
    hasJoined: true,
  },
];

const sharedBucketLists: BucketList[] = [
  {
    id: 'bucket-shared-1',
    title: 'Nairobi Nightlife',
    isPublic: true,
    coverPhoto: '/images/santorini.webp',
    savedCount: 8,
    previewPhotos: [],
    members: mockMembers,
    owner: { id: 'member-1', name: 'Tony Ouma' },
    isOwner: false,
    hasJoined: false,
  },
  {
    id: 'bucket-shared-2',
    title: 'Trail Running Crew',
    isPublic: true,
    coverPhoto: '/images/man-bridge-running.webp',
    savedCount: 5,
    previewPhotos: [],
    members: mockMembers.slice(1),
    owner: { id: 'member-2', name: 'Wanjiku Kamau' },
    isOwner: false,
    hasJoined: false,
  },
];

// TODO(backend): GET /v1/bucket-lists/
export const fetchMyBucketLists = async (): Promise<ApiResponse> => {
  await wait(MOCK_LATENCY_MS);
  return { status: 200, success: true, data: { results: [...myBucketLists] } };
};

// TODO(backend): GET /v1/bucket-lists/shared/
export const fetchSharedBucketLists = async (): Promise<ApiResponse> => {
  await wait(MOCK_LATENCY_MS);
  return { status: 200, success: true, data: { results: [...sharedBucketLists] } };
};

// TODO(backend): POST /v1/bucket-lists/
export const createBucketList = async (payload: CreateBucketListPayload): Promise<ApiResponse> => {
  await wait(MOCK_LATENCY_MS);
  const created: BucketList = {
    id: `bucket-${Date.now()}`,
    title: payload.title,
    isPublic: payload.isPublic,
    coverPhoto: null,
    savedCount: 0,
    previewPhotos: [],
    members: [],
    owner: { id: 'me', name: 'You' },
    isOwner: true,
    hasJoined: true,
  };
  myBucketLists.push(created);
  return { status: 201, success: true, data: created };
};

// TODO(backend): POST /v1/bucket-lists/{id}/join/
export const joinBucketList = async (bucketListId: string): Promise<ApiResponse> => {
  await wait(MOCK_LATENCY_MS);
  const bucketList = sharedBucketLists.find((list) => list.id === bucketListId);
  if (bucketList) {
    bucketList.hasJoined = true;
  }
  return { status: 200, success: true, data: bucketList ?? null };
};
