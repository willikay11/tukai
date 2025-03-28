import NextAuth, { Session } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { profile, signIn } from "@/services/auth";
import jwt, { JwtPayload } from 'jsonwebtoken';
import { parseSnakeToCamel } from "@/utils/parseSnakeToCamel";
import { User } from "@/types/user";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }

        const response = await signIn(credentials.email, credentials.password);

        const decoded = parseSnakeToCamel(jwt.decode(response.access)) as JwtPayload;
        
        if (!decoded) {
          throw new Error("Invalid token");
        }

        const user: User = await profile(decoded.userId);
        return user;
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }: { token: any, user: any }) {
        if (user) {
          token.id = user.id;
          token.name = user.displayName;
          token.email = user.email;
          token.picture = user.picture;
        }
        return token;
      },
    async session({ session, token }: { session: any, token: any }) {
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

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
