import { parseSnakeToCamel } from '@/utils/parseSnakeToCamel';

import { api } from './apiService';

export interface TermsOfServiceResponse {
  id: string;
  title: string;
  slug: string;
  content: string;
  metaDescription: string;
  isFeatured: boolean;
  order: number;
  dateCreated: string;
  dateModified: string;
}

export const getTermsOfService = async (): Promise<TermsOfServiceResponse> => {
  const response = await api.get<TermsOfServiceResponse>('/v1/pages/terms/');
  return parseSnakeToCamel(response.data);
};
