import { apiWithToken } from '@/services/apiService';
import { parseApiError } from '@/utils/parseApiError';

export type TukaiReviewDraftRequest = {
  subjectType: 'place' | 'experience';
  /** The place's or experience's id or slug */
  subjectId: string;
  /** A few words on what to say, or how to change the text */
  brief: string;
  rating?: number;
  /** A review to rewrite; left out to write one */
  currentText?: string;
};

/** Why a draft wasn't written: `allowance` once the month's free uses are gone. */
export class TukaiDraftError extends Error {
  constructor(
    message: string,
    public reason: 'allowance' | 'other',
  ) {
    super(message);
  }
}

export const TUKAI_BRIEF_MAX = 1000;
export const TUKAI_REWRITE_MAX = 5000;

/**
 * TukAI writes a review from a short brief, or rewrites the one given
 * (DEV-375). Nothing is saved: the text comes back for the person to edit and
 * post. Each draft uses one of the month's free TukAI uses; 402 once they're
 * gone.
 */
export async function draftTukaiReview(request: TukaiReviewDraftRequest): Promise<string> {
  try {
    const api = await apiWithToken();
    const currentText = request.currentText?.trim();
    const response = await api.post('/v1/tukai/review-drafts/', {
      subject_type: request.subjectType,
      subject_id: request.subjectId,
      brief: request.brief.trim().slice(0, TUKAI_BRIEF_MAX),
      ...(request.rating ? { rating: request.rating } : {}),
      ...(currentText ? { current_text: currentText.slice(0, TUKAI_REWRITE_MAX) } : {}),
    });
    const text = String(response.data?.text ?? '').trim();
    if (!text) throw new TukaiDraftError('TukAI could not write it just now.', 'other');
    return text;
  } catch (error: any) {
    if (error instanceof TukaiDraftError) throw error;
    console.error('TukAI review draft:', error.response?.data || error.message);
    if (error.response?.status === 402) {
      throw new TukaiDraftError('You have used this month’s free TukAI messages.', 'allowance');
    }
    throw new TukaiDraftError(
      parseApiError(error.response?.data, 'TukAI could not write it just now.'),
      'other',
    );
  }
}
