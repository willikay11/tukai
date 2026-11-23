import { ApiResponse } from '@/types/apiResponse';
import { CommunityPostsQueryParams, CreateCommunity } from '@/types/community';
import { assertValidImageFiles } from '@/utils/images';
import { parseApiError } from '@/utils/parseApiError';
import { parseSnakeToCamel } from '@/utils/parseSnakeToCamel';

import { api, apiWithToken } from './apiService';

export async function getCommunities(
  category?: string[],
  page: number = 1,
  perPage: number = 6,
  search?: string,
  showUpComingExperiences?: boolean,
  recommendedCommunities?: boolean,
  popularCommunities?: boolean,
  following?: boolean,
  createdBy?: string,
  // An object so the next filter is not an eleventh argument
  options?: {
    /** Accepted members only - unlike `following`, no pending invites or requests (DEV-436) */
    joined?: boolean;
    /** Whose memberships `joined` reads; the caller's when left out (DEV-436) */
    member?: string;
    /** Communities that own a place or host an experience in this city (DEV-434) */
    city?: string;
  },
) {
  try {
    const queryParams = new URLSearchParams();
    if (page) queryParams.append('page', page.toString());
    if (perPage) queryParams.append('page_size', perPage.toString());
    if (search) queryParams.append('search', search);
    category?.forEach((cat) => queryParams.append('category', cat));
    if (showUpComingExperiences) queryParams.append('upcoming_experiences', 'true');
    if (recommendedCommunities) queryParams.append('recommended', 'true');
    if (popularCommunities) queryParams.append('popular', '4');
    if (following) queryParams.append('following', 'true');
    if (createdBy) queryParams.append('created_by', createdBy);
    if (options?.joined) queryParams.append('joined', 'true');
    if (options?.member) queryParams.append('member', options.member);
    if (options?.city) queryParams.append('city', options.city);
    queryParams.append('status', 'published');

    const api = await apiWithToken();

    const response = await api.get(`/v1/communities/?${queryParams.toString()}`);

    return {
      status: response.status,
      success: true,
      data: parseSnakeToCamel(response.data),
    };
  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);

    return {
      status: error.response?.status || 500,
      success: false,
      message: parseApiError(error.response?.data, 'An unexpected error occurred'),
    };
  }
}

export async function fetchCommunity(communityId: string, withSession = false) {
  try {
    // No Authorization header by default: signed out this sent "Bearer
    // undefined", which the API rejects - and the community page is public now.
    // Client callers pass `withSession` so a signed-in reader is still
    // recognised: the API turns away anonymous requests where it is locked
    // down (staging), and the members then never arrive.
    const client = withSession ? await apiWithToken() : api;
    const response = await client.get(`/v1/communities/${communityId}`);
    return {
      status: response.status,
      success: true,
      data: parseSnakeToCamel(response.data),
    };
  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);

    return {
      status: error.response?.status || 500,
      success: false,
      message: parseApiError(error.response?.data, 'An unexpected error occurred'),
    };
  }
}

export async function joinCommunity(communityId: string) {
  try {
    const api = await apiWithToken();

    const response = await api.post(`/v1/communities/${communityId}/request-to-join/`, {
      community_id: communityId,
    });
    return {
      status: response.status,
      success: true,
      data: parseSnakeToCamel(response.data),
    };
  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);
    throw new Error(parseApiError(error.response?.data, 'An unexpected error occurred'));
  }
}

/**
 * The communities the reader has an unanswered invite to, newest first -
 * including ones sent to their email before they signed up (DEV-380).
 */
export async function fetchCommunityInvites() {
  try {
    const api = await apiWithToken();
    const response = await api.get('/v1/communities/invites/', { params: { page_size: 50 } });
    return {
      status: response.status,
      success: true,
      data: parseSnakeToCamel(response.data),
    };
  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);
    return {
      status: error.response?.status || 500,
      success: false,
      message: parseApiError(error.response?.data, 'Your invites could not load'),
    };
  }
}

/**
 * Accepts an invite. Joins straight away, a private community included -
 * `request-to-join` would turn the invite into a request the host must
 * approve (DEV-381).
 */
export async function acceptCommunityInvite(communityId: string) {
  try {
    const api = await apiWithToken();
    const response = await api.post(`/v1/communities/${communityId}/accept-invite/`);
    return { status: response.status, success: true, data: parseSnakeToCamel(response.data) };
  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);
    throw new Error(parseApiError(error.response?.data, 'The invite could not be accepted'));
  }
}

/**
 * Declines an invite for good. The reader can still ask to join later
 * (DEV-381).
 */
export async function declineCommunityInvite(communityId: string) {
  try {
    const api = await apiWithToken();
    const response = await api.post(`/v1/communities/${communityId}/decline-invite/`);
    return { status: response.status, success: true };
  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);
    throw new Error(parseApiError(error.response?.data, 'The invite could not be declined'));
  }
}

/**
 * One message to every member, from the owner or a co-host. Each member gets
 * it in their inbox; anyone blocked either way is skipped (DEV-379).
 */
export async function messageCommunityMembers(
  communityId: string,
  content: string,
): Promise<{ sent: number }> {
  try {
    const api = await apiWithToken();
    const response = await api.post(`/v1/communities/${communityId}/message-members/`, {
      content,
    });
    return { sent: Number(response.data?.sent ?? 0) };
  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);
    throw new Error(parseApiError(error.response?.data, 'Your message could not be sent'));
  }
}

/**
 * A host answering join requests: `accepted` lets them in, `rejected` turns
 * them down - they can ask again later (DEV-447).
 */
export async function answerJoinRequest(
  communityId: string,
  userId: string,
  answer: 'accepted' | 'rejected',
) {
  try {
    const api = await apiWithToken();
    const response = await api.post(`/v1/communities/${communityId}/update-join-status/`, {
      invite_status: answer,
      user_ids: [userId],
    });
    return { status: response.status, success: true };
  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);
    throw new Error(parseApiError(error.response?.data, 'The request could not be answered'));
  }
}

/**
 * The swagger's own `leave` route. It also withdraws a join request still
 * waiting on a host (DEV-447). `remove-member`, which this used before, is
 * documented as owner/admin only, so a member removing themselves could be
 * turned away. Owners cannot leave their own community.
 */
export async function leaveCommunity(communityId: string) {
  try {
    const api = await apiWithToken();

    const response = await api.post(`/v1/communities/${communityId}/leave/`, {});
    return {
      status: response.status,
      success: true,
      data: parseSnakeToCamel(response.data),
    };
  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);
    throw new Error(parseApiError(error.response?.data, 'An unexpected error occurred'));
  }
}

/**
 * Takes someone out of a community - here, an owner cancelling an invite that
 * was never accepted. Owner/admin only on the API.
 */
export async function removeCommunityMember(communityId: string, userId: string) {
  try {
    const api = await apiWithToken();

    const response = await api.post(`/v1/communities/${communityId}/remove-member/`, {
      user: userId,
    });
    return {
      status: response.status,
      success: true,
      data: parseSnakeToCamel(response.data),
    };
  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);
    throw new Error(parseApiError(error.response?.data, 'An unexpected error occurred'));
  }
}

/** Phone, email and socials - a separate endpoint from the detail one. */
export async function fetchCommunityContact(communityId: string) {
  try {
    const api = await apiWithToken();
    const response = await api.get(`/v1/communities/${communityId}/contact/`);
    return {
      status: response.status,
      success: true,
      data: parseSnakeToCamel(response.data),
    };
  } catch (error: any) {
    return {
      status: error.response?.status || 500,
      success: false,
      message: parseApiError(error.response?.data, 'An unexpected error occurred'),
    };
  }
}

/** Ratings of the community's past experiences, newest first. */
export async function fetchCommunityRatings(communityId: string, pageSize = 100) {
  try {
    const api = await apiWithToken();
    const response = await api.get(`/v1/communities/${communityId}/ratings/`, {
      params: { page: 1, page_size: pageSize },
    });
    return {
      status: response.status,
      success: true,
      data: parseSnakeToCamel(response.data),
    };
  } catch (error: any) {
    return {
      status: error.response?.status || 500,
      success: false,
      message: parseApiError(error.response?.data, 'An unexpected error occurred'),
    };
  }
}

/**
 * The places a community owns (an approved claim) or has hosted experiences
 * at - owned first, then the most used (DEV-382).
 */
export async function fetchCommunityPlaces(communityId: string, pageSize = 12) {
  try {
    const api = await apiWithToken();
    const response = await api.get(`/v1/communities/${communityId}/places/`, {
      params: { page: 1, page_size: pageSize },
    });
    return { status: response.status, success: true, data: parseSnakeToCamel(response.data) };
  } catch (error: any) {
    return {
      status: error.response?.status || 500,
      success: false,
      message: parseApiError(error.response?.data, 'The places could not load'),
    };
  }
}

/** The average, count and per-star split across all its ratings (DEV-383). */
export async function fetchCommunityRatingSummary(communityId: string) {
  try {
    const api = await apiWithToken();
    const response = await api.get(`/v1/communities/${communityId}/ratings/summary/`);
    return { status: response.status, success: true, data: parseSnakeToCamel(response.data) };
  } catch (error: any) {
    return {
      status: error.response?.status || 500,
      success: false,
      message: parseApiError(error.response?.data, 'The rating could not load'),
    };
  }
}

export async function joinCommunityWithToken(communityId: string, token?: string) {
  try {
    const api = await apiWithToken();

    const response = await api.post(`/v1/communities/${communityId}/members/join-via-invite/`, {
      token: token,
    });

    return {
      status: response.status,
      success: true,
      data: parseSnakeToCamel(response.data),
    };
  } catch (error: any) {
    throw new Error(parseApiError(error.response?.data, 'An unexpected error occurred'));
  }
}

export async function fetchCommunityPosts(params: CommunityPostsQueryParams) {
  try {
    const api = await apiWithToken();
    const response = await api.get(`/v1/communities/posts/`, { params });

    return {
      status: response.status,
      success: true,
      data: parseSnakeToCamel(response.data),
    };
  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);

    throw {
      status: error.response?.status || 500,
      success: false,
      message: parseApiError(error.response?.data, 'An unexpected error occurred'),
    };
  }
}

export async function fetchCommunityPostPhotos(communityId: string) {
  try {
    const api = await apiWithToken();
    const response = await api.get(`/v1/communities/${communityId}/post-photos/`);

    return {
      status: response.status,
      success: true,
      data: parseSnakeToCamel(response.data),
    };
  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);

    throw {
      status: error.response?.status || 500,
      success: false,
      message: parseApiError(error.response?.data, 'An unexpected error occurred'),
    };
  }
}

export async function createCommunityPhotos(communityId: string, photos: File[]) {
  try {
    const api = await apiWithToken();
    await assertValidImageFiles(photos);
    const formData = new FormData();
    photos.forEach((photo) => {
      formData.append('new_photos', photo);
    });
    const response = await api.post(`/v1/communities/${communityId}/photos/`, formData, {
      headers: {
        'Content-Type': undefined,
      },
    });

    return {
      status: response.status,
      success: true,
      data: parseSnakeToCamel(response.data),
    };
  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);

    throw {
      status: error.response?.status || 500,
      success: false,
      message: parseApiError(error.response?.data, 'An unexpected error occurred'),
    };
  }
}

export async function createCommunity(data: CreateCommunity) {
  try {
    const api = await apiWithToken();
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('google_map_place_id', data.googleMapPlaceId);
    data.invitedMemberIds.forEach((memberId) => {
      formData.append('invited_members_ids', memberId);
    });
    data.invitedCommunityIds.forEach((communityId) => {
      formData.append('invited_communities_ids', communityId);
    });
    data.invitedEmails.forEach((email) => {
      formData.append('invited_emails', email);
    });
    data.categoriesIds.forEach((categoryId) => {
      formData.append('categories_ids', categoryId);
    });
    formData.append('is_public', data.isPublic.toString());
    if (data.status) {
      formData.append('status', data.status);
    }

    if (data.newPhotos && data.newPhotos.length > 0) {
      await assertValidImageFiles(data.newPhotos);
      data.newPhotos.forEach((photo, index) => {
        const fileName = photo.name || `image_${Date.now()}_${index}`;
        formData.append('new_photos', photo, fileName);
      });
    }

    const response = await api.post(`/v1/communities/`, formData, {
      headers: {
        'Content-Type': undefined,
      },
    });

    return {
      status: response.status,
      success: true,
      data: parseSnakeToCamel(response.data),
    };
  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);

    throw {
      status: error.response?.status || 500,
      success: false,
      message: parseApiError(error.response?.data, 'An unexpected error occurred'),
    };
  }
}

/**
 * Opens a verification application for a community. Proof-of-ownership
 * documents hang off this, and it is what a place-ownership claim is reviewed
 * against.
 *
 * Fails if a pending or under-review application already exists, so a caller
 * that only needs "there is an open application" can treat that 400 as success.
 */
export async function submitCommunityVerification(communityId: string): Promise<ApiResponse> {
  try {
    const api = await apiWithToken();
    const response = await api.post(`/v1/communities/${communityId}/verification/`, {});

    return { status: response.status, success: true, data: parseSnakeToCamel(response.data) };
  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);
    throw {
      status: error.response?.status || 500,
      success: false,
      message: parseApiError(error.response?.data, 'Could not start verification'),
    };
  }
}

/** One supporting document - PDF, JPEG or PNG, up to 10 MB. */
export async function uploadVerificationDocument(
  communityId: string,
  documentType: string,
  file: File,
  notes?: string,
): Promise<ApiResponse> {
  try {
    const api = await apiWithToken();
    const formData = new FormData();
    formData.append('document_type', documentType);
    formData.append('file', file);
    if (notes) formData.append('notes', notes);

    const response = await api.post(
      `/v1/communities/${communityId}/verification/documents/`,
      formData,
      { headers: { 'Content-Type': undefined } },
    );

    return { status: response.status, success: true, data: parseSnakeToCamel(response.data) };
  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);
    throw {
      status: error.response?.status || 500,
      success: false,
      message: parseApiError(error.response?.data, 'Could not upload this document'),
    };
  }
}

export async function fetchVerificationDocuments(communityId: string): Promise<ApiResponse> {
  try {
    const api = await apiWithToken();
    const response = await api.get(`/v1/communities/${communityId}/verification/documents/`);

    return { status: response.status, success: true, data: parseSnakeToCamel(response.data) };
  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);
    throw {
      status: error.response?.status || 500,
      success: false,
      message: parseApiError(error.response?.data, 'Could not load the documents'),
    };
  }
}

// The API refuses once the application is approved or rejected
export async function deleteVerificationDocument(
  communityId: string,
  documentId: string,
): Promise<ApiResponse> {
  try {
    const api = await apiWithToken();
    const response = await api.delete(
      `/v1/communities/${communityId}/verification/documents/${documentId}/`,
    );

    return { status: response.status, success: true };
  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);
    throw {
      status: error.response?.status || 500,
      success: false,
      message: parseApiError(error.response?.data, 'Could not remove this document'),
    };
  }
}
