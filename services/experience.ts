import { ca } from 'date-fns/locale';

import { api, apiWithToken } from '@/services/apiService';
import { ApiResponse } from '@/types/apiResponse';
import { CreateExperience, CreateExperienceTicket } from '@/types/experience';
import { PurchaserDetails } from '@/types/purchaser';
import { assertValidImageFiles } from '@/utils/images';
import { parseSnakeToCamel } from '@/utils/parseSnakeToCamel';

export type ExperiencesQueryParams = {
  search?: string;
  bookmarked?: string;
  sold_out?: boolean;
  is_public?: boolean;
  is_paid?: boolean;
  status?: string;
  category?: string;
  reserved_by?: string;
  hosted_by?: string;
  page?: number;
  page_size?: number;
  invited?: boolean;
  date?: string;
};

export async function fetchExperiences(params: ExperiencesQueryParams): Promise<ApiResponse> {
  try {
    let response;
    if (params.invited) {
      const axiosInstance = await apiWithToken();
      response = await axiosInstance.get(`/v1/experiences/`, { params });
    } else {
      response = await api.get(`/v1/experiences/`, { params });
    }

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

export async function fetchExperience(id: string, withAuth: boolean = false): Promise<ApiResponse> {
  try {
    const axiosInstance = withAuth ? await apiWithToken() : api;
    const response = await axiosInstance.get(`/v1/experiences/${id}`);
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

export async function purchaseExperienceTicket(data: PurchaserDetails): Promise<ApiResponse> {
  try {
    const response = await api.post(`/v1/experiences/ticket-purchases/`, data);

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
      message:
        error.response?.data?.message || 'An error occurred while processing your ticket purchase.',
      data: error.response?.data,
    };
  }
}

export async function bookmarkExperience(id: string): Promise<ApiResponse> {
  try {
    const axiosInstance = await apiWithToken();
    const response = await axiosInstance.post(`/v1/experiences/${id}/bookmark/`);

    return {
      status: response.status,
      success: true,
      data: parseSnakeToCamel(response.data),
    };
  } catch (error: any) {
    console.log('API Error:', error.response?.data || error.message);

    throw {
      status: error.response?.status || 500,
      success: false,
      message: error.response?.data?.message || 'An unexpected error occurred',
    };
  }
}

export async function createExperience(data: CreateExperience): Promise<ApiResponse> {
  try {
    const axiosInstance = await apiWithToken();
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('google_map_place_id', data.googleMapPlaceId);
    formData.append('start_date', data.startDate);
    formData.append('end_date', data.endDate);
    formData.append('recurrence_rule', data.recurrence_rule);
    data.categoriesIds.forEach((id) => formData.append('categories_ids', id));
    if (data.isPublic !== undefined) {
      formData.append('is_public', String(data.isPublic));
    }

    if (data.isPaid !== undefined) {
      formData.append('is_paid', String(data.isPaid));
    }

    if (data.hostCommunityId) {
      formData.append('host_community_id', data.hostCommunityId);
    }

    if (data.whatsIncluded) {
      formData.append('whats_included', data.whatsIncluded);
    }

    if (data.whatsNotIncluded) {
      formData.append('whats_not_included', data.whatsNotIncluded);
    }

    if (data.feesAllocation) {
      formData.append('fees_allocation', data.feesAllocation);
    }

    if (data.meetingPlace !== undefined && data.meetingPlace !== null) {
      formData.append('meeting_place', data.meetingPlace);
    }

    if (data.meetingTime !== undefined && data.meetingTime !== null) {
      formData.append('meeting_time', data.meetingTime);
    }

    const response = await axiosInstance.post(`/v2/experiences/`, formData, {
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

export async function updateExperience(id: string, data: CreateExperience): Promise<ApiResponse> {
  try {
    const axiosInstance = await apiWithToken();
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('google_map_place_id', data.googleMapPlaceId);
    formData.append('start_date', data.startDate);
    formData.append('end_date', data.endDate);
    formData.append('recurrence_rule', data.recurrence_rule);
    data.categoriesIds.forEach((id) => formData.append('categories_ids', id));
    if (data.isPublic !== undefined) {
      formData.append('is_public', String(data.isPublic));
    }

    if (data.isPaid !== undefined) {
      formData.append('is_paid', String(data.isPaid));
    }

    if (data.hostCommunityId) {
      formData.append('host_community_id', data.hostCommunityId);
    }

    if (data.whatsIncluded) {
      formData.append('whats_included', data.whatsIncluded);
    }

    if (data.whatsNotIncluded) {
      formData.append('whats_not_included', data.whatsNotIncluded);
    }

    if (data.invitedCommunityIds) {
      data.invitedCommunityIds.forEach((id) => formData.append('invited_community_ids', id));
    }

    if (data.feesAllocation) {
      formData.append('fees_allocation', data.feesAllocation);
    }

    if (data.meetingPlace !== undefined && data.meetingPlace !== null) {
      formData.append('meeting_place', data.meetingPlace);
    }

    if (data.meetingTime !== undefined && data.meetingTime !== null) {
      formData.append('meeting_time', data.meetingTime);
    }

    const response = await axiosInstance.patch(`/v2/experiences/${id}/`, formData, {
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

export async function createExperienceTicket(
  experienceId: string,
  data: CreateExperienceTicket,
): Promise<ApiResponse> {
  try {
    const axiosInstance = await apiWithToken();
    const response = await axiosInstance.post(`/v2/experiences/${experienceId}/tickets/`, data);

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

export async function updateExperienceTicket(
  experienceId: string,
  ticketId: string,
  data: CreateExperienceTicket,
): Promise<ApiResponse> {
  try {
    const axiosInstance = await apiWithToken();
    const response = await axiosInstance.patch(
      `/v2/experiences/${experienceId}/tickets/${ticketId}/`,
      data,
    );

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

export const deleteExperienceTicket = async (
  experienceId: string,
  ticketId: string,
): Promise<ApiResponse> => {
  try {
    const axiosInstance = await apiWithToken();
    const response = await axiosInstance.delete(
      `/v1/experiences/${experienceId}/tickets/${ticketId}/`,
    );

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
};

export const addGuestToExperience = async (id: string, email: string) => {
  try {
    const axiosInstance = await apiWithToken();
    const response = await axiosInstance.post(`/v1/experiences/${id}/guests/`, { email });
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
};

export const publishExperience = async (id: string): Promise<ApiResponse> => {
  try {
    const axiosInstance = await apiWithToken();
    const response = await axiosInstance.post(`/v1/experiences/${id}/publish/`);
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
};

export const addExperiencePhotos = async (
  experienceId: string,
  photos: File[],
): Promise<ApiResponse> => {
  try {
    await assertValidImageFiles(photos);
    const axiosInstance = await apiWithToken();
    const formData = new FormData();
    formData.append('experience', experienceId);
    photos.forEach((photo, index) => {
      const fileName = photo.name || `image_${Date.now()}_${index}`;
      formData.append('new_photos', photo, fileName);
    });

    const response = await axiosInstance.post(`/v1/experiences/photos/`, formData, {
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
};

export const deleteExperiencePhoto = async (photoId: string): Promise<ApiResponse> => {
  try {
    const axiosInstance = await apiWithToken();
    const response = await axiosInstance.delete(`/v1/experiences/photos/${photoId}/`);

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
};

export const searchUsers = async (query: string): Promise<ApiResponse> => {
  try {
    const axiosInstance = await apiWithToken();
    const response = await axiosInstance.get(`/v1/users/search/`, {
      params: { search: query },
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
};

export interface CreateSlotTemplateData {
  weekday: string;
  startTime: string;
  endTime: string;
}

export const createSlotTemplate = async (
  experienceId: string,
  data: CreateSlotTemplateData,
): Promise<ApiResponse> => {
  try {
    const axiosInstance = await apiWithToken();
    const response = await axiosInstance.post(
      `/v1/experiences/${experienceId}/slot-templates/`,
      data,
    );

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
};

export const deleteSlotTemplate = async (
  experienceId: string,
  templateId: string,
): Promise<ApiResponse> => {
  try {
    const axiosInstance = await apiWithToken();
    const response = await axiosInstance.delete(
      `/v1/experiences/${experienceId}/slot-templates/${templateId}/`,
    );

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
};
