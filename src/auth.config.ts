import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  trustHost: true,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.login = String(user.login);
        token.role = user.role as "ADMIN" | "MEMBER";
        token.status = user.status as "ACTIVE" | "INACTIVE";
        token.familyId = String(user.familyId);
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.login = typeof token.login === "string" ? token.login : "";
        session.user.role = (token.role as "ADMIN" | "MEMBER") || "MEMBER";
        session.user.status = (token.status as "ACTIVE" | "INACTIVE") || "ACTIVE";
        session.user.familyId = typeof token.familyId === "string" ? token.familyId : "";
      }

      return session;
    },
  },
} satisfies NextAuthConfig;
