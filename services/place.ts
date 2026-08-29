import { api, apiWithToken } from '@/services/apiService';
import { ApiResponse } from '@/types/apiResponse';
import { PlaceCategoryParams } from '@/types/networkParam';
import { CreatePlaceBookingRequest } from '@/types/placeReservation';
import { parseApiError } from '@/utils/parseApiError';
import { parseCamelToSnake, parseSnakeToCamel } from '@/utils/parseSnakeToCamel';

export async function fetchPlaces(
  page = 1,
  perPage = 12,
  categoryId?: string | string[],
  search?: string,
  lat?: number,
  lng?: number,
): Promise<ApiResponse> {
  try {
    const queryParams = new URLSearchParams();
    if (categoryId) {
      if (Array.isArray(categoryId)) {
        categoryId.forEach((id) => {
          if (id !== 'all') {
            queryParams.append('category', id);
          }
        });
      } else if (categoryId !== 'all') {
        queryParams.append('category', categoryId);
      }
    }
    if (page) queryParams.append('page', page.toString());
    if (perPage) queryParams.append('page_size', perPage.toString());
    if (search) queryParams.append('search', search);
    if (lat !== undefined) queryParams.append('lat', String(lat));
    if (lng !== undefined) queryParams.append('long', String(lng));

    const res = await api.get(`/v1/places/?${queryParams.toString()}`);

    return {
      status: res.status,
      success: true,
      data: parseSnakeToCamel(res.data),
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

export async function fetchPlace(id?: string): Promise<ApiResponse> {
  try {
    const res = await api.get(`/v1/places/${id}`);

    return {
      status: res.status,
      success: true,
      data: parseSnakeToCamel(res.data),
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

export async function fetchPlaceCategories(params?: PlaceCategoryParams): Promise<ApiResponse> {
  try {
    const res = await api.get('/v1/places/categories/', { params: parseCamelToSnake(params) });

    return {
      status: 200,
      success: true,
      data: parseSnakeToCamel(res.data),
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

export async function fetchPlaceProperties(id: string): Promise<ApiResponse> {
  try {
    const res = await api.get(`/v1/places/${id}/properties`);

    return {
      status: res.status,
      success: true,
      data: parseSnakeToCamel(res.data),
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

export async function fetchPlaceSocialLinks(id: string): Promise<ApiResponse> {
  try {
    const res = await api.get(`/v1/places/${id}/social-links`);

    return {
      status: res.status,
      success: true,
      data: parseSnakeToCamel(res.data),
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

export async function fetchPlaceReviews(id: string): Promise<ApiResponse> {
  try {
    const res = await api.get(`/v1/places/${id}/reviews/`);

    return {
      status: res.status,
      success: true,
      data: parseSnakeToCamel(res.data),
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

export async function fetchPlaceReviewComments(id: string, reviewId: string): Promise<ApiResponse> {
  try {
    const res = await api.get(`/v1/places/${id}/reviews/${reviewId}/comments/`);

    return {
      status: res.status,
      success: true,
      data: parseSnakeToCamel(res.data),
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

export async function createPlaceReviewComment(
  id: string,
  reviewId: string,
  data: any,
): Promise<ApiResponse> {
  try {
    const api = await apiWithToken();
    const res = await api.post(`/v1/places/${id}/reviews/${reviewId}/comments/`, data);

    return {
      status: res.status,
      success: true,
      data: parseSnakeToCamel(res.data),
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

export async function likePlaceReviewComment(
  id: string,
  reviewId: string,
  commentId?: string,
  data?: any,
): Promise<ApiResponse> {
  try {
    const api = await apiWithToken();
    const res = await api.post(
      `/v1/places/${id}/reviews/${reviewId}/comments/${commentId}/like/`,
      data,
    );

    return {
      status: res.status,
      success: true,
      data: parseSnakeToCamel(res.data),
    };
  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);

    return {
      status: error.response?.status || 500,
      success: false,
    };
  }
}

export async function likePlaceReview(
  id: string,
  reviewId: string,
  data: any,
): Promise<ApiResponse> {
  try {
    const api = await apiWithToken();
    const res = await api.post(`/v1/places/${id}/reviews/${reviewId}/like/`, data);

    return {
      status: res.status,
      success: true,
      data: parseSnakeToCamel(res.data),
    };
  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);

    return {
      status: error.response?.status || 500,
      success: false,
    };
  }
}

export async function bookmarkPlace(id: string, data: any): Promise<ApiResponse> {
  try {
    const api = await apiWithToken();
    const res = await api.post(`/v1/places/${id}/bookmark/`, data);

    return {
      status: res.status,
      success: true,
      data: parseSnakeToCamel(res.data),
    };
  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);

    return {
      status: error.response?.status || 500,
      success: false,
    };
  }
}

export async function createPlaceReview(id: string, data: any): Promise<ApiResponse> {
  try {
    const api = await apiWithToken();
    const res = await api.post(`/v1/places/${id}/reviews/`, data);

    return {
      status: res.status,
      success: true,
      data: parseSnakeToCamel(res.data),
    };
  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);

    return {
      status: error.response?.status || 500,
      success: false,
    };
  }
}

export async function uploadPlaceReviewImages(
  id: string,
  reviewId: string,
  data: any,
): Promise<ApiResponse> {
  try {
    const api = await apiWithToken();
    const res = await api.post(`/v1/places/${id}/reviews/${reviewId}/photos/`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return {
      status: res.status,
      success: true,
      data: parseSnakeToCamel(res.data),
    };
  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);

    return {
      status: error.response?.status || 500,
      success: false,
    };
  }
}

export async function updatePlaceReview(
  id: string,
  reviewId: string,
  data: any,
): Promise<ApiResponse> {
  try {
    const api = await apiWithToken();
    const res = await api.put(`/v1/places/${id}/reviews/${reviewId}/`, data);

    return {
      status: res.status,
      success: true,
      data: parseSnakeToCamel(res.data),
    };
  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);

    return {
      status: error.response?.status || 500,
      success: false,
    };
  }
}

export async function deletePlaceReview(id: string, reviewId: string): Promise<ApiResponse> {
  try {
    const api = await apiWithToken();
    const res = await api.delete(`/v1/places/${id}/reviews/${reviewId}/`);

    return {
      status: res.status,
      success: true,
      data: parseSnakeToCamel(res.data),
    };
  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);

    return {
      status: error.response?.status || 500,
      success: false,
    };
  }
}

export async function deletePlaceReviewImage(
  id: string,
  reviewId: string,
  imageId: string,
): Promise<ApiResponse> {
  try {
    const api = await apiWithToken();
    const res = await api.delete(`/v1/places/${id}/reviews/${reviewId}/photos/${imageId}/`);

    return {
      status: res.status,
      success: true,
      data: parseSnakeToCamel(res.data),
    };
  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);

    return {
      status: error.response?.status || 500,
      success: false,
    };
  }
}

export async function fetchGoogleMapsAutocomplete(input: string): Promise<ApiResponse> {
  try {
    const res = await fetch(`/api/places/autocomplete?input=${encodeURIComponent(input)}`);
    const data = await res.json();

    if (!res.ok) {
      return {
        status: res.status,
        success: false,
        message: data.message || 'Failed to fetch autocomplete results',
      };
    }

    return {
      status: res.status,
      success: true,
      data: data.data,
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

export async function fetchGoogleMapsPlaceGeocode(placeId: string): Promise<ApiResponse> {
  try {
    const res = await fetch(`/api/places/geocode?placeId=${encodeURIComponent(placeId)}`);
    const data = await res.json();

    if (!res.ok) {
      return {
        status: res.status,
        success: false,
        message: data.message || 'Failed to geocode place',
      };
    }

    return {
      status: res.status,
      success: true,
      data: data.data,
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

// ─── Reservations ──────────────────────────────────────────────────────────
//
// A place becomes bookable when its owning community creates a reservation
// PROFILE. Diners then post a booking REQUEST against that profile, which the
// API turns into a Purchase with status "requested" for the venue to accept.
//
// Note these are deliberately NOT the experiences ticket-purchase endpoints —
// per the API spec, places have their own path precisely so the two do not
// share a booking flow.

export async function fetchPlaceReservationProfiles(placeId: string): Promise<ApiResponse> {
  try {
    const res = await api.get(`/v1/places/${placeId}/reservation-profile/`);

    return { status: res.status, success: true, data: parseSnakeToCamel(res.data) };
  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);
    throw {
      status: error.response?.status || 500,
      success: false,
      message: parseApiError(error.response?.data, 'An unexpected error occurred'),
    };
  }
}

export async function fetchPlaceAvailability(
  placeId: string,
  profileId: string,
): Promise<ApiResponse> {
  try {
    // Rules are the weekly hours; exceptions are one-off closures and overrides
    const [rules, exceptions] = await Promise.all([
      api.get(`/v1/places/${placeId}/reservation-profile/${profileId}/availability-rules/`),
      api.get(`/v1/places/${placeId}/reservation-profile/${profileId}/availability-exceptions/`),
    ]);

    return {
      status: rules.status,
      success: true,
      data: {
        rules: parseSnakeToCamel(rules.data)?.results ?? [],
        exceptions: parseSnakeToCamel(exceptions.data)?.results ?? [],
      },
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

export async function fetchPlaceBookingRequests(
  placeId: string,
  profileId: string,
): Promise<ApiResponse> {
  try {
    const axiosInstance = await apiWithToken();
    const res = await axiosInstance.get(
      `/v1/places/${placeId}/reservation-profile/${profileId}/booking-requests/`,
    );

    return { status: res.status, success: true, data: parseSnakeToCamel(res.data) };
  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);
    throw {
      status: error.response?.status || 500,
      success: false,
      message: parseApiError(error.response?.data, 'An unexpected error occurred'),
    };
  }
}

export async function createPlaceBookingRequest(
  placeId: string,
  profileId: string,
  data: CreatePlaceBookingRequest,
): Promise<ApiResponse> {
  try {
    const axiosInstance = await apiWithToken();
    // Flat body — requested_date, requested_time and party_size — not the
    // ticket_purchases array the experience purchase paths take
    const res = await axiosInstance.post(
      `/v1/places/${placeId}/reservation-profile/${profileId}/booking-requests/`,
      parseCamelToSnake(data),
    );

    return { status: res.status, success: true, data: parseSnakeToCamel(res.data) };
  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);
    throw {
      status: error.response?.status || 500,
      success: false,
      message: parseApiError(error.response?.data, 'Could not request this reservation'),
    };
  }
}

/**
 * Cancelling a table booking goes through the SHARED purchase action, not a
 * place path — the spec is explicit that "accept/decline/pay/cancel stay on the
 * unified experiences-api:ticket-purchases-* actions - not duplicated here".
 */
export async function cancelPlaceBookingRequest(purchaseId: string): Promise<ApiResponse> {
  try {
    const axiosInstance = await apiWithToken();
    const res = await axiosInstance.patch(`/v1/experiences/ticket-purchases/${purchaseId}/cancel/`);

    return { status: res.status, success: true, data: parseSnakeToCamel(res.data) };
  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);
    throw {
      status: error.response?.status || 500,
      success: false,
      message: parseApiError(error.response?.data, 'Could not cancel this reservation'),
    };
  }
}

/**
 * The people the reader follows — the source for the reservation invite list.
 * `GET /accounts/users/?following=<id>` is the only friend-shaped query the API
 * offers; there is no dedicated friends endpoint.
 */
export async function fetchFollowing(userId: string): Promise<ApiResponse> {
  try {
    const axiosInstance = await apiWithToken();
    const res = await axiosInstance.get(`/v1/accounts/users/`, {
      params: { following: userId, page_size: 50 },
    });

    return { status: res.status, success: true, data: parseSnakeToCamel(res.data) };
  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);
    throw {
      status: error.response?.status || 500,
      success: false,
      message: parseApiError(error.response?.data, 'Could not load your friends'),
    };
  }
}

/**
 * Ownership of a place is held by a COMMUNITY, not a person — the claimant must
 * be an owner or admin of a published community, and a place can only have one
 * approved owner.
 */
export async function claimPlaceOwnership(
  placeId: string,
  communityId: string,
): Promise<ApiResponse> {
  try {
    const axiosInstance = await apiWithToken();
    const res = await axiosInstance.post(`/v1/places/${placeId}/ownership/`, {
      community_id: communityId,
    });

    return { status: res.status, success: true, data: parseSnakeToCamel(res.data) };
  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);
    throw {
      status: error.response?.status || 500,
      success: false,
      message: parseApiError(error.response?.data, 'Could not claim this place'),
    };
  }
}

/**
 * Adds a place that is not on Tukai yet, so it can then be claimed. The API
 * requires a Google Maps place id and at least one photo, which is why the
 * "new place" branch of the claim form asks for both.
 */
export async function createPlace(data: {
  title: string;
  description: string;
  googleMapPlaceId: string;
  categoriesIds?: string[];
  newPhotos: File[];
}): Promise<ApiResponse> {
  try {
    const axiosInstance = await apiWithToken();
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('google_map_place_id', data.googleMapPlaceId);
    (data.categoriesIds ?? []).forEach((categoryId) =>
      formData.append('categories_ids', categoryId),
    );
    data.newPhotos.forEach((photo, index) =>
      formData.append('new_photos', photo, photo.name || `image_${Date.now()}_${index}`),
    );

    const res = await axiosInstance.post(`/v1/places/`, formData, {
      headers: { 'Content-Type': undefined },
    });

    return { status: res.status, success: true, data: parseSnakeToCamel(res.data) };
  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);
    throw {
      status: error.response?.status || 500,
      success: false,
      message: parseApiError(error.response?.data, 'Could not add this place'),
    };
  }
}
