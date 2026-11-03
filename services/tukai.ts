import axios from 'axios';

import { ApiResponse } from '@/types/apiResponse';
import type { TukaiChatRequest, TukaiReply } from '@/types/tukai';

/**
 * TukAI's own route handlers (app/api/tukai), on this app's origin. The
 * model is called there, never from the browser.
 */
const tukaiApi = axios.create({ headers: { 'Content-Type': 'application/json' }, timeout: 75_000 });

export async function sendTukaiMessage(
  request: TukaiChatRequest,
): Promise<ApiResponse<TukaiReply>> {
  try {
    const response = await tukaiApi.post<TukaiReply>('/api/tukai/chat', request);
    return { status: response.status, success: true, data: response.data };
  } catch (error: any) {
    console.error('TukAI Error:', error.response?.data || error.message);

    return {
      status: error.response?.status || 500,
      success: false,
      message: error.response?.data?.message || 'TukAI could not answer just now.',
    };
  }
}
