import { api, apiWithToken } from '@/services/apiService';
import { ApiResponse } from '@/types/apiResponse';
import { AddBucketListItemPayload, CreateBucketListPayload } from '@/types/bucket-list';
import { parseApiError } from '@/utils/parseApiError';
import { parseCamelToSnake, parseSnakeToCamel } from '@/utils/parseSnakeToCamel';

/**
 * Bucket lists - a reader's saved experiences and places, and the people they
 * share them with.
 *
 * These were mocked in-memory while the endpoints 404'd. They answer now (401
 * without a token, where a route that does not exist still gives 404), so the
 * mock is gone and every call below is the real one.
 */
export const fetchMyBucketLists = async (page = 1, pageSize = 24): Promise<ApiResponse> => {
  try {
    const axiosInstance = await apiWithToken();
    const res = await axiosInstance.get(`/v1/accounts/bucket-lists/`, {
      params: { page, page_size: pageSize },
    });

    return { status: res.status, success: true, data: parseSnakeToCamel(res.data) };
  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);
    throw {
      status: error.response?.status || 500,
      success: false,
      message: parseApiError(error.response?.data, 'Could not load your bucket lists'),
    };
  }
};

/**
 * Every list anyone has made public.
 *
 * Unauthenticated by design - the endpoint says so - so this uses the plain
 * `api` instance. A reader who is not signed in still sees the section.
 */
export const fetchPublicBucketLists = async (page = 1, pageSize = 16): Promise<ApiResponse> => {
  try {
    const res = await api.get(`/v1/accounts/bucket-lists/public/`, {
      params: { page, page_size: pageSize },
    });

    return { status: res.status, success: true, data: parseSnakeToCamel(res.data) };
  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);
    throw {
      status: error.response?.status || 500,
      success: false,
      message: parseApiError(error.response?.data, 'Could not load public bucket lists'),
    };
  }
};

/** One list, with the items it holds and the people on it. */
export const fetchBucketList = async (bucketListId: string): Promise<ApiResponse> => {
  try {
    const axiosInstance = await apiWithToken();
    const res = await axiosInstance.get(`/v1/accounts/bucket-lists/${bucketListId}/`);

    return { status: res.status, success: true, data: parseSnakeToCamel(res.data) };
  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);
    throw {
      status: error.response?.status || 500,
      success: false,
      message: parseApiError(error.response?.data, 'Could not load this bucket list'),
    };
  }
};

export const createBucketList = async (data: CreateBucketListPayload): Promise<ApiResponse> => {
  try {
    const axiosInstance = await apiWithToken();
    const res = await axiosInstance.post(`/v1/accounts/bucket-lists/`, parseCamelToSnake(data));

    return { status: res.status, success: true, data: parseSnakeToCamel(res.data) };
  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);
    throw {
      status: error.response?.status || 500,
      success: false,
      message: parseApiError(error.response?.data, 'Could not create this bucket list'),
    };
  }
};

export const updateBucketList = async (
  bucketListId: string,
  data: Partial<CreateBucketListPayload>,
): Promise<ApiResponse> => {
  try {
    const axiosInstance = await apiWithToken();
    const res = await axiosInstance.patch(
      `/v1/accounts/bucket-lists/${bucketListId}/`,
      parseCamelToSnake(data),
    );

    return { status: res.status, success: true, data: parseSnakeToCamel(res.data) };
  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);
    throw {
      status: error.response?.status || 500,
      success: false,
      message: parseApiError(error.response?.data, 'Could not save these changes'),
    };
  }
};

export const deleteBucketList = async (bucketListId: string): Promise<ApiResponse> => {
  try {
    const axiosInstance = await apiWithToken();
    const res = await axiosInstance.delete(`/v1/accounts/bucket-lists/${bucketListId}/`);

    return { status: res.status, success: true, data: null };
  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);
    throw {
      status: error.response?.status || 500,
      success: false,
      message: parseApiError(error.response?.data, 'Could not delete this bucket list'),
    };
  }
};

/** Saves an experience or a place onto a list. Send one or the other. */
export const addBucketListItem = async (
  bucketListId: string,
  data: AddBucketListItemPayload,
): Promise<ApiResponse> => {
  try {
    const axiosInstance = await apiWithToken();
    const res = await axiosInstance.post(
      `/v1/accounts/bucket-lists/${bucketListId}/items/`,
      parseCamelToSnake(data),
    );

    return { status: res.status, success: true, data: parseSnakeToCamel(res.data) };
  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);
    throw {
      status: error.response?.status || 500,
      success: false,
      message: parseApiError(error.response?.data, 'Could not add this to the list'),
    };
  }
};

export const removeBucketListItem = async (
  bucketListId: string,
  itemId: string,
): Promise<ApiResponse> => {
  try {
    const axiosInstance = await apiWithToken();
    const res = await axiosInstance.delete(
      `/v1/accounts/bucket-lists/${bucketListId}/items/${itemId}/`,
    );

    return { status: res.status, success: true, data: null };
  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);
    throw {
      status: error.response?.status || 500,
      success: false,
      message: parseApiError(error.response?.data, 'Could not remove this from the list'),
    };
  }
};

/**
 * Opens a shared list by its token.
 *
 * Public - the whole point of a share link is that it works before the reader
 * has an account.
 */
export const fetchSharedBucketList = async (shareToken: string): Promise<ApiResponse> => {
  try {
    const res = await api.get(`/v1/accounts/bucket-lists/join/${shareToken}/`);

    return { status: res.status, success: true, data: parseSnakeToCamel(res.data) };
  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);
    throw {
      status: error.response?.status || 500,
      success: false,
      message: parseApiError(error.response?.data, 'Could not open this bucket list'),
    };
  }
};

/** Takes the reader up on a share link. */
export const joinBucketList = async (shareToken: string): Promise<ApiResponse> => {
  try {
    const axiosInstance = await apiWithToken();
    const res = await axiosInstance.post(`/v1/accounts/bucket-lists/join/${shareToken}/`, {});

    return { status: res.status, success: true, data: parseSnakeToCamel(res.data) };
  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);
    throw {
      status: error.response?.status || 500,
      success: false,
      message: parseApiError(error.response?.data, 'Could not join this bucket list'),
    };
  }
};

/** The link to hand out, minted on demand. */
/**
 * Step off a list someone shared with you.
 *
 * The list itself is untouched: a public one stays readable, it simply stops
 * being one of yours.
 */
export const leaveBucketList = async (bucketListId: string): Promise<ApiResponse> => {
  try {
    const api = await apiWithToken();
    await api.delete(`/v1/accounts/bucket-lists/${bucketListId}/members/leave/`);

    return { status: 204, success: true } as ApiResponse;
  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);

    throw new Error(parseApiError(error.response?.data, 'Could not leave this list'));
  }
};

export const fetchBucketListShare = async (bucketListId: string): Promise<ApiResponse> => {
  try {
    const axiosInstance = await apiWithToken();
    const res = await axiosInstance.get(`/v1/accounts/bucket-lists/${bucketListId}/share/`);

    return { status: res.status, success: true, data: parseSnakeToCamel(res.data) };
  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);
    throw {
      status: error.response?.status || 500,
      success: false,
      message: parseApiError(error.response?.data, 'Could not get a link for this list'),
    };
  }
};

/**
 * Sets the order items appear in, as a list of item ids.
 *
 * The whole order is sent rather than a moved id and a destination - the API
 * takes the final sequence, so a reorder is one request however many things
 * moved.
 */
export const reorderBucketListItems = async (
  bucketListId: string,
  order: string[],
): Promise<ApiResponse> => {
  try {
    const axiosInstance = await apiWithToken();
    const res = await axiosInstance.patch(
      `/v1/accounts/bucket-lists/${bucketListId}/items/reorder/`,
      { order },
    );

    return { status: res.status, success: true, data: parseSnakeToCamel(res.data) };
  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);
    throw {
      status: error.response?.status || 500,
      success: false,
      message: parseApiError(error.response?.data, 'Could not save this order'),
    };
  }
};

/**
 * The lists the reader has joined and does not own - public ones they follow
 * and private ones they were invited onto. The same collection as
 * `fetchMyBucketLists`, which on its own returns only the lists they own.
 */
export const fetchFollowingBucketLists = async (page = 1, pageSize = 48): Promise<ApiResponse> => {
  try {
    const axiosInstance = await apiWithToken();
    const res = await axiosInstance.get(`/v1/accounts/bucket-lists/`, {
      params: { following: true, page, page_size: pageSize },
    });

    return { status: res.status, success: true, data: parseSnakeToCamel(res.data) };
  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);
    throw {
      status: error.response?.status || 500,
      success: false,
      message: parseApiError(error.response?.data, 'Could not load the lists you follow'),
    };
  }
};

/**
 * Joins a public list by its id - the Join button in the drawer. Private lists
 * are only ever joined by accepting an invite, so this 404s on one.
 */
export const joinPublicBucketList = async (bucketListId: string): Promise<ApiResponse> => {
  try {
    const axiosInstance = await apiWithToken();
    const res = await axiosInstance.post(`/v1/accounts/bucket-lists/${bucketListId}/join/`, {});

    return { status: res.status, success: true, data: parseSnakeToCamel(res.data) };
  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);
    throw new Error(parseApiError(error.response?.data, 'Could not join this bucket list'));
  }
};

/**
 * Everyone on a list, pending invites included. Owner only - anyone else reads
 * the accepted members off the detail endpoint instead.
 */
export const fetchBucketListMembers = async (bucketListId: string): Promise<ApiResponse> => {
  try {
    const axiosInstance = await apiWithToken();
    const res = await axiosInstance.get(`/v1/accounts/bucket-lists/${bucketListId}/members/`);

    return { status: res.status, success: true, data: parseSnakeToCamel(res.data) };
  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);
    throw {
      status: error.response?.status || 500,
      success: false,
      message: parseApiError(error.response?.data, 'Could not load the members of this list'),
    };
  }
};

/**
 * The reader's own membership of a list, invites still waiting included. Works
 * on a private list the reader cannot otherwise open, which is what lets an
 * invite be shown before it is accepted.
 */
export const fetchMyBucketListMembership = async (bucketListId: string): Promise<ApiResponse> => {
  try {
    const axiosInstance = await apiWithToken();
    const res = await axiosInstance.get(`/v1/accounts/bucket-lists/${bucketListId}/members/me/`);

    return { status: res.status, success: true, data: parseSnakeToCamel(res.data) };
  } catch (error: any) {
    throw {
      status: error.response?.status || 500,
      success: false,
      message: parseApiError(error.response?.data, 'Could not load this invite'),
    };
  }
};

/** Invites one person, by account or by email. Send one or the other. */
export const inviteBucketListMember = async (
  bucketListId: string,
  invitee: { userId?: string; email?: string },
): Promise<ApiResponse> => {
  try {
    const axiosInstance = await apiWithToken();
    const res = await axiosInstance.post(
      `/v1/accounts/bucket-lists/${bucketListId}/members/invite/`,
      parseCamelToSnake(invitee),
    );

    return { status: res.status, success: true, data: parseSnakeToCamel(res.data) };
  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);
    throw new Error(parseApiError(error.response?.data, 'Could not send this invite'));
  }
};

/**
 * Takes someone off a list - a member, or an invite they have not answered
 * yet, which is how an invite is cancelled. Owner only.
 */
export const removeBucketListMember = async (
  bucketListId: string,
  userId: string,
): Promise<ApiResponse> => {
  try {
    const axiosInstance = await apiWithToken();
    await axiosInstance.delete(`/v1/accounts/bucket-lists/${bucketListId}/members/${userId}/`);

    return { status: 204, success: true } as ApiResponse;
  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);
    throw new Error(parseApiError(error.response?.data, 'Could not remove this person'));
  }
};

export const acceptBucketListInvite = async (bucketListId: string): Promise<ApiResponse> => {
  try {
    const axiosInstance = await apiWithToken();
    const res = await axiosInstance.post(
      `/v1/accounts/bucket-lists/${bucketListId}/members/accept/`,
      {},
    );

    return { status: res.status, success: true, data: parseSnakeToCamel(res.data) };
  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);
    throw new Error(parseApiError(error.response?.data, 'Could not accept this invite'));
  }
};

export const declineBucketListInvite = async (bucketListId: string): Promise<ApiResponse> => {
  try {
    const axiosInstance = await apiWithToken();
    await axiosInstance.post(`/v1/accounts/bucket-lists/${bucketListId}/members/decline/`, {});

    return { status: 204, success: true } as ApiResponse;
  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);
    throw new Error(parseApiError(error.response?.data, 'Could not decline this invite'));
  }
};
