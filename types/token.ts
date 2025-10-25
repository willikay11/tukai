export type Token = {
    id: string;
    name: string;
    email: string;
    picture: string;
    interests: string[];
    accessToken: string;
    refreshToken: string;
    accessTokenExpires: number;
    hasInterests: boolean;
    hasBillingDetails: boolean;
    hasSubscribed: boolean;
}