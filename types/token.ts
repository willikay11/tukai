export type Token = {
  id: string;
  name: string;
  // The user's @handle, when they have set one
  displayName?: string | null;
  email: string;
  picture: string;
  interests: string[];
  accessToken: string;
  refreshToken: string;
  accessTokenExpires: number;
  hasInterests: boolean;
  hasBillingDetails: boolean;
  hasSubscribed: boolean;
};
