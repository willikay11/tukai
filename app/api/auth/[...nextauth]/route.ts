import NextAuth from 'next-auth';
import AppleProvider from 'next-auth/providers/apple';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';

import jwt from 'jsonwebtoken';

import {
  profile as getProfile,
  getUserInterests,
  refreshToken,
  signIn,
  socialSignIn,
} from '@/services/auth';
import { Interest } from '@/types/interest';
import { JwtPayload } from '@/types/jwt';
import { Token } from '@/types/token';
import { User } from '@/types/user';
import { parseSnakeToCamel } from '@/utils/parseSnakeToCamel';

function generateAppleClientSecret() {
  const privateKey = process.env.APPLE_PRIVATE_KEY?.replace(/\\n/g, '\n').trim();

  if (!privateKey?.includes('BEGIN PRIVATE KEY')) {
    throw new Error('Invalid Apple private key');
  }

  return jwt.sign(
    {
      iss: process.env.APPLE_TEAM_ID!,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 15777000,
      aud: 'https://appleid.apple.com',
      sub: process.env.APPLE_CLIENT_ID!,
    },
    privateKey,
    {
      algorithm: 'ES256',
      keyid: process.env.APPLE_KEY_ID!,
    },
  );
}

// ✅ Extend NextAuth Session type
declare module 'next-auth' {
  interface Session {
    user: {
      id?: string | null;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      accessToken?: string | null;
      hasInterests?: boolean | null;
      hasBillingDetails?: boolean | null;
      hasSubscribed?: boolean | null;
      interests?: Interest[] | null;
    };
    error?: string;
  }
}

async function refreshAccessToken(token: Token) {
  try {
    const data = await refreshToken(token.refreshToken);

    // Decode new access token to extract expiry
    const decoded = jwt.decode(data.access) as JwtPayload;
    const accessTokenExpires = decoded?.exp ? decoded.exp * 1000 : Date.now() + 3600 * 1000;

    return {
      ...token,
      accessToken: data.access,
      accessTokenExpires,
      refresh: token.refreshToken,
    };
  } catch (error: any) {
    return {
      ...token,
      accessToken: undefined,
      refreshToken: undefined,
      accessTokenExpires: 0,
      error: 'RefreshAccessTokenError',
    };
  }
}

export const authOptions = {
  trustHost: true,
  providers: [
    // 🔹 Google OAuth
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    // 🔹 Apple OAuth
    AppleProvider({
      clientId: process.env.APPLE_CLIENT_ID!,
      clientSecret: (() => generateAppleClientSecret()) as unknown as string,
    }),

    // 🔹 Credentials login
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Missing email or password');
        }

        const response = await signIn(credentials.email, credentials.password);

        const decoded = parseSnakeToCamel(jwt.decode(response.access)) as JwtPayload;

        if (!decoded) throw new Error('Invalid token');

        const user: User = await getProfile(decoded.userId, response.access);

        return {
          ...user,
          hasInterests: decoded?.hasInterests,
          hasBillingDetails: decoded?.hasBillingDetails,
          hasSubscribed: decoded?.hasSubscribed,
          emailVerified: decoded?.emailVerified,
          accessToken: response.access,
          refreshToken: response.refresh,
        };
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, user, account, profile }: any) {
      // --- Initial login: Google ---
      if (account?.provider === 'google') {
        const response = await socialSignIn('google-oauth2', account.access_token);
        const decoded = parseSnakeToCamel(jwt.decode(response.access)) as JwtPayload;
        const interests: Interest[] = await getUserInterests(decoded.userId, response.access);

        token.id = decoded?.userId;
        token.name = profile?.name;
        token.email = profile?.email;
        token.picture = profile?.picture;
        token.accessToken = response.access;
        token.refreshToken = response.refresh;
        token.accessTokenExpires = decoded?.exp ? decoded.exp * 1000 : Date.now() + 3600 * 1000;
        token.hasInterests = interests.length > 0;
        token.hasBillingDetails = decoded?.hasBillingDetails;
        token.hasSubscribed = decoded?.hasSubscribed;
        token.emailVerified = decoded?.emailVerified;
        token.interests = interests;
        return token;
      }

      // --- Initial login: Apple ---
      if (account?.provider === 'apple') {
        const response = await socialSignIn('apple-id', account.id_token);
        const decoded = parseSnakeToCamel(jwt.decode(response.access)) as JwtPayload;
        const interests: Interest[] = await getUserInterests(decoded.userId, response.access);

        token.id = decoded?.userId;
        token.name = profile?.name || user?.name;
        token.email = profile?.email || user?.email;
        token.picture = profile?.picture;
        token.accessToken = response.access;
        token.refreshToken = response.refresh;
        token.accessTokenExpires = decoded?.exp ? decoded.exp * 1000 : Date.now() + 3600 * 1000;
        token.hasInterests = interests.length > 0;
        token.hasBillingDetails = decoded?.hasBillingDetails;
        token.hasSubscribed = decoded?.hasSubscribed;
        token.emailVerified = decoded?.emailVerified;
        token.interests = interests;
        return token;
      }

      // --- Initial login: Credentials ---
      if (user) {
        const decoded = jwt.decode(user.accessToken) as JwtPayload;
        token.id = user.id;
        token.name = user.displayName ?? `${user.firstName} ${user.lastName}`;
        token.email = user.email;
        token.picture = user.picture;
        token.interests = user.interests;
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.accessTokenExpires = decoded?.exp ? decoded.exp * 1000 : Date.now() + 3600 * 1000;
        token.hasInterests = user.hasInterests;
        token.hasBillingDetails = user.hasBillingDetails;
        token.hasSubscribed = user.hasSubscribed;
        return token;
      }

      // --- If token is still valid, return it ---
      if (Date.now() < (token.accessTokenExpires || 0)) {
        return token;
      }

      // --- Otherwise, refresh it ---
      return await refreshAccessToken(token);
    },

    async session({ session, token }: { session: any; token: any }) {
      session.user = {
        id: token.id,
        name: token.name,
        email: token.email,
        image: token.picture,
        interests: token.interests,
        accessToken: token.accessToken,
        hasInterests: token.hasInterests,
        hasBillingDetails: token.hasBillingDetails,
        hasSubscribed: token.hasSubscribed,
        emailVerified: token.emailVerified,
      };
      session.error = token.error;
      return session;
    },
  },
};

// Export for Next.js App Router (app/api/auth/[...nextauth]/route.ts)
const handler = NextAuth(authOptions as any);
export { handler as GET, handler as POST };
