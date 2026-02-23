import { getAuthSession } from '@/lib/auth';
import { CommunityPostsQueryParams, CreateCommunity } from '@/types/community';
import { parseSnakeToCamel } from '@/utils/parseSnakeToCamel';

import { api, apiWithToken } from './apiService';

const hasImageSignature = (headerBytes: Uint8Array) => {
  const startsWith = (signature: number[]) =>
    signature.every((byte, index) => headerBytes[index] === byte);

  const isJpeg = startsWith([0xff, 0xd8, 0xff]);
  const isPng = startsWith([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const isGif = startsWith([0x47, 0x49, 0x46, 0x38]);
  const isWebp =
    startsWith([0x52, 0x49, 0x46, 0x46]) &&
    headerBytes[8] === 0x57 &&
    headerBytes[9] === 0x45 &&
    headerBytes[10] === 0x42 &&
    headerBytes[11] === 0x50;
  const isBmp = startsWith([0x42, 0x4d]);
  const isTiff =
    startsWith([0x49, 0x49, 0x2a, 0x00]) || startsWith([0x4d, 0x4d, 0x00, 0x2a]);

  return isJpeg || isPng || isGif || isWebp || isBmp || isTiff;
};

const isSvgContent = async (file: File) => {
  const textSample = await file.slice(0, 1024).text();
  return /<svg[\s>]/i.test(textSample);
};

async function validateImageFile(file: File) {
  if (!(file instanceof File)) {
    return false;
  }

  if (file.size <= 0) {
    return false;
  }

  if (file.type && !file.type.startsWith('image/')) {
    return false;
  }

  if (file.type === 'image/svg+xml') {
    return isSvgContent(file);
  }

  const headerBuffer = await file.slice(0, 12).arrayBuffer();
  const headerBytes = new Uint8Array(headerBuffer);
  return hasImageSignature(headerBytes);
}

async function assertValidImageFiles(photos: File[]) {
  const validationResults = await Promise.all(
    photos.map(async (photo) => ({
      fileName: photo?.name || 'unknown-file',
      isValid: await validateImageFile(photo),
    })),
  );

  const invalidFiles = validationResults.filter((result) => !result.isValid);

  if (invalidFiles.length > 0) {
    throw new Error(
      `Invalid image file(s): ${invalidFiles.map((file) => file.fileName).join(', ')}`,
    );
  }
}

export async function getInterestBasedCommunities(
  category?: string[],
  page: number = 1,
  perPage: number = 6,
  search?: string,
  showUpComingExperiences?: boolean,
  recommendedCommunities?: boolean,
  popularCommunities?: boolean,
  following?: boolean,
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
      message: error.response?.data?.message || 'An unexpected error occurred',
    };
  }
}

export async function fetchCommunity(communityId: string) {
  try {
    const session: any = await getAuthSession();

    const response = await api.get(`/v1/communities/${communityId}`, {
      headers: {
        Authorization: `Bearer ${session?.user?.accessToken}`,
      },
    });
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
      message: error.response?.data?.message || 'An unexpected error occurred',
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
    throw new Error(error.response?.data?.message || 'An unexpected error occurred');
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
    throw new Error(error?.response?.data?.error || 'An unexpected error occurred');
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
      message: error.response?.data?.message || 'An unexpected error occurred',
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
      message: error.response?.data?.message || 'An unexpected error occurred',
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
      message: error.response?.data?.message || 'An unexpected error occurred',
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
      message: error.response?.data?.message || 'An unexpected error occurred',
    };
  }
}
