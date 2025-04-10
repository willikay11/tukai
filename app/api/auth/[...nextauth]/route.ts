import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { profile, signIn, socialSignIn } from '@/services/auth';
import jwt from 'jsonwebtoken';
import { parseSnakeToCamel } from '@/utils/parseSnakeToCamel';
import { User } from '@/types/user';
import { JwtPayload } from '@/types/jwt';

// Define the extended session type
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
    };
  }
}

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
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

        if (!decoded) {
          throw new Error('Invalid token');
        }

        const user: User = await profile(decoded.userId);
        return {
          ...user,
          hasInterests: decoded?.hasInterests,
          hasBillingDetails: decoded?.hasBillingDetails,
          hasSubscribed: decoded?.hasSubscribed,
          accessToken: response.access,
          refreshToken: response.refresh,
        };
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn() {
      // console.log(credentials);
      // const response = await userExists(profile?.email);
      // if (response?.exists) {
      //   return '/auth/sign-in?error=UserExists';
      // }
      return true;
    },
    async jwt({
      token,
      user,
      account,
      profile,
    }: {
      token: any;
      user: any;
      account: any;
      profile: any;
    }) {
      if (account?.provider === 'google') {
        const response = await socialSignIn('google-oauth2', account?.access_token);
        const decoded = parseSnakeToCamel(jwt.decode(response.access)) as JwtPayload;

        if (!decoded) {
          throw new Error('Invalid token');
        }
        token.id = decoded?.userId;
        token.name = profile?.name;
        token.email = profile?.email;
        token.picture = profile?.picture;
        token.accessToken = response.access;
        token.refreshToken = response.refresh;
        token.emailVerified = decoded?.emailVerified;
        token.hasInterests = decoded?.hasInterests;
        token.hasBillingDetails = decoded?.hasBillingDetails;
        token.hasSubscribed = decoded?.hasSubscribed;
      } else if (user) {
        token.id = user.id;
        token.name = user.displayName;
        token.email = user.email;
        token.picture = user.picture;
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.hasInterests = user.hasInterests;
        token.hasBillingDetails = user.hasBillingDetails;
        token.hasSubscribed = user.hasSubscribed;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      session.user = {
        id: token.id,
        name: token.name,
        email: token.email,
        image: token.picture,
        accessToken: token.accessToken,
        hasInterests: token.hasInterests,
        hasBillingDetails: token.hasBillingDetails,
        hasSubscribed: token.hasSubscribed,
      };
      return session;
    },
  },
};

const handler = NextAuth(authOptions as any);
export { handler as GET, handler as POST };
