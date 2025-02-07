import axios from 'axios';
import { parseSnakeToCamel } from '@/utils/parseSnakeToCamel';
import api from '@/services/apiService';
import { ApiResponse } from '@/types/apiResponse';

export async function fetchPlaces(): Promise<ApiResponse> {
  try {
    const res = await api.get('/v1/places/');

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
      message: error.response?.data?.message || 'An unexpected error occurred',
    };
  }
}

export async function fetchPlaceCategories(): Promise<ApiResponse> {
  try {
    const res = await axios.get('https://api.tukai.co/v1/places/categories/', {
      headers: {
        Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3MiOiJhY2Nlc3MiLCJleHAiOjE3NDU5NTQwMDYsImlhdCI6MTczODE3ODAwNiwianRpIjoiY2I3YTA1MzEwMTcwNDk0NWJiNzgxMDM1MTAzNTllMTEiLCJ1c2VyX2lkIjoiMDU4Yjc4NTMtYzVmNC00ZTQzLWIzNTYtZGExZThjZTA1ZjZlIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImhhc19pbnRlcmVzdHMiOnRydWUsImhhc19iaWxsaW5nX2RldGFpbHMiOnRydWUsImhhc19zdWJzY3JpYmVkIjp0cnVlfQ.sdlHd4g5vpgQgbbHzx-MokjQMbXciMArky6ipesKGXA`,
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
      message: error.response?.data?.message || 'An unexpected error occurred',
    };
  }
}
