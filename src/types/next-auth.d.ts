import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      login: string;
      role: "ADMIN" | "MEMBER";
      status: "ACTIVE" | "INACTIVE";
      familyId: string;
    };
  }

  interface User {
    id: string;
    login: string;
    role: "ADMIN" | "MEMBER";
    status: "ACTIVE" | "INACTIVE";
    familyId: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    login?: string;
    role?: "ADMIN" | "MEMBER";
    status?: "ACTIVE" | "INACTIVE";
    familyId?: string;
  }
}
