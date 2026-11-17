import axios from 'axios';

import { ApiResponse } from '@/types/apiResponse';
import type { TukaiChatRequest, TukaiConfirmRequest, TukaiReply } from '@/types/tukai';

/**
 * TukAI's own route handlers (app/api/tukai), on this app's origin. They pass
 * each call on to the TukAI agent service with the person's access token.
 */
const tukaiApi = axios.create({ headers: { 'Content-Type': 'application/json' }, timeout: 75_000 });

const failure = (label: string, error: any): ApiResponse<never> => {
  console.error(`TukAI ${label}:`, error.response?.data || error.message);
  return {
    status: error.response?.status || 500,
    success: false,
    message: error.response?.data?.message || 'TukAI could not answer just now.',
  };
};

export async function sendTukaiMessage(
  request: TukaiChatRequest,
): Promise<ApiResponse<TukaiReply>> {
  try {
    const response = await tukaiApi.post<TukaiReply>('/api/tukai/chat', request);
    return { status: response.status, success: true, data: response.data };
  } catch (error: any) {
    return failure('chat', error);
  }
}

export async function confirmTukaiAction(
  request: TukaiConfirmRequest,
): Promise<ApiResponse<TukaiReply>> {
  try {
    const response = await tukaiApi.post<TukaiReply>('/api/tukai/confirm', request);
    return { status: response.status, success: true, data: response.data };
  } catch (error: any) {
    return failure('confirm', error);
  }
}

export async function deleteTukaiSession(sessionId: string): Promise<ApiResponse<null>> {
  try {
    const response = await tukaiApi.delete(`/api/tukai/session/${encodeURIComponent(sessionId)}`);
    return { status: response.status, success: true, data: null };
  } catch (error: any) {
    return failure('delete session', error);
  }
}
