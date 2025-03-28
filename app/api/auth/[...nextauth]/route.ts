import NextAuth, { Session } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { profile, signIn, socialSignIn } from '@/services/auth';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { parseSnakeToCamel } from '@/utils/parseSnakeToCamel';
import { User } from '@/types/user';

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
          accessToken: response.access,
          refreshToken: response.refresh,
        };
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn() {
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
        const response = await socialSignIn('google-oauth2', account.access_token);
        if (response.access) {
          token.accessToken = account.access_token;
          token.refreshToken = account.refresh_token;
        } else {
          return false;
        }
        token.id = profile?.sub;
        token.name = profile?.name;
        token.email = profile?.email;
        token.picture = profile?.picture;
      } else if (user) {
        token.id = user.id;
        token.name = user.displayName;
        token.email = user.email;
        token.picture = user.picture;
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      session.user = {
        id: token.id,
        name: token.name,
        email: token.email,
        image: token.picture,
      };
      return session;
    },
  },
};

const handler = NextAuth(authOptions as any);
export { handler as GET, handler as POST };
