import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { findUserByEmail, ROLE_DASHBOARD } from "@/lib/auth";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const user = findUserByEmail(credentials?.email as string);
        if (!user || user.password !== credentials?.password) return null;
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          tenantId: user.tenantId,
          tenantName: user.tenantName,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // @ts-expect-error – extending default JWT type
        token.role = user.role;
        // @ts-expect-error
        token.tenantId = user.tenantId;
        // @ts-expect-error
        token.tenantName = user.tenantName;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        // @ts-expect-error – extending default Session type
        session.user.role = token.role;
        // @ts-expect-error
        session.user.tenantId = token.tenantId;
        // @ts-expect-error
        session.user.tenantName = token.tenantName;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      return url.startsWith(baseUrl) ? url : baseUrl;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
});

export { ROLE_DASHBOARD };

