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

export async function fetchExperience(id: string): Promise<ApiResponse> {
  try {
    const response = await api.get(`/v1/experiences/${id}`);
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

    if (data.newPhotos && data.newPhotos.length > 0) {
      await assertValidImageFiles(data.newPhotos);
      data.newPhotos.forEach((photo, index) => {
        const fileName = photo.name || `image_${Date.now()}_${index}`;
        formData.append('new_photos', photo, fileName);
      });
    }

    const response = await axiosInstance.post(`/v1/experiences/`, formData, {
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

export async function createExperienceTicket(data: CreateExperienceTicket): Promise<ApiResponse> {
  try {
    const axiosInstance = await apiWithToken();
    const response = await axiosInstance.post(`/v1/experiences/tickets/`, data);

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
