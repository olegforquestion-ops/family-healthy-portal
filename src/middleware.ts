import { NextResponse } from "next/server";
<<<<<<< HEAD

import { auth } from "@/auth";
=======
import NextAuth from "next-auth";

import { authConfig } from "@/auth.config";

const { auth } = NextAuth(authConfig);
>>>>>>> 6594672 (Исправление контейнера)

const publicPaths = ["/login"];

export default auth((req) => {
  const pathname = req.nextUrl.pathname;
  const isPublic = publicPaths.some((path) => pathname.startsWith(path));
  const isAuthenticated = Boolean(req.auth?.user);

  if (!isAuthenticated && !isPublic) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  if (isAuthenticated && isPublic) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  if (pathname.startsWith("/admin") && req.auth?.user.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  if (pathname.startsWith("/family") && req.auth?.user.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
