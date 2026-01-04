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

export interface PrivacyPolicyResponse {
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

export const getPrivacyPolicy = async (): Promise<PrivacyPolicyResponse> => {
  const response = await api.get<PrivacyPolicyResponse>('/v1/pages/privacy/');
  return parseSnakeToCamel(response.data);
};
