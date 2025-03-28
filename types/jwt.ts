export type JwtPayload = {
  userId: string;
  exp: number;
  iat: number;
  jti: string;
  emailVerified: boolean;
  hasInterests: boolean;
  hasBillingDetails: boolean;
  hasSubscribed: boolean;
};
