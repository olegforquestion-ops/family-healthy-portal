import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";

<<<<<<< HEAD
=======
import { authConfig } from "@/auth.config";
>>>>>>> 6594672 (Исправление контейнера)
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";

const credentialsSchema = z.object({
  login: z.string().min(1),
  password: z.string().min(1),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
<<<<<<< HEAD
  trustHost: true,
  secret: env.AUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.login = user.login;
        token.role = user.role;
        token.status = user.status;
        token.familyId = user.familyId;
      } else if (token.sub && !token.familyId) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { familyId: true },
        });

        token.familyId = dbUser?.familyId;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.login = token.login || "";
        session.user.role = (token.role as "ADMIN" | "MEMBER") || "MEMBER";
        session.user.status = (token.status as "ACTIVE" | "INACTIVE") || "ACTIVE";
        session.user.familyId = (token.familyId as string) || "";
      }

      return session;
    },
  },
=======
  ...authConfig,
  secret: env.AUTH_SECRET,
>>>>>>> 6594672 (Исправление контейнера)
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        login: { label: "Login", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);

        if (!parsed.success) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { login: parsed.data.login },
          include: {
            role: true,
          },
        });

        if (!user || user.status !== "ACTIVE") {
          return null;
        }

        const isValid = await verifyPassword(parsed.data.password, user.passwordHash);

        if (!isValid) {
          return null;
        }

        await prisma.user.update({
          where: { id: user.id },
          data: {
            lastLoginAt: new Date(),
          },
        });

        return {
          id: user.id,
          name: user.displayName,
          login: user.login,
          role: user.roleCode as "ADMIN" | "MEMBER",
          status: user.status,
          familyId: user.familyId,
        };
      },
    }),
  ],
});
