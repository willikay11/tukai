import { parseSnakeToCamel } from '@/utils/parseSnakeToCamel';

import { api } from './apiService';

export interface PageResponse {
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

export const getTermsOfService = async (): Promise<PageResponse> => {
  const response = await api.get<PageResponse>('/v1/pages/terms/');
  return parseSnakeToCamel(response.data);
};

export const getPrivacyPolicy = async (): Promise<PageResponse> => {
  const response = await api.get<PageResponse>('/v1/pages/privacy/');
  return parseSnakeToCamel(response.data);
};

export const getHelp = async (): Promise<PageResponse> => {
  const response = await api.get<PageResponse>('/v1/pages/help/');
  return parseSnakeToCamel(response.data);
};
