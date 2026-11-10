import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const ROLE_ROUTES: Record<string, string[]> = {
  "/superadmin": ["SUPERADMIN"],
  "/admin": ["SUPERADMIN", "ADMIN"],
  "/teacher": ["SUPERADMIN", "ADMIN", "TEACHER"],
  "/student": ["SUPERADMIN", "STUDENT"],
};

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const role = (req.auth?.user as any)?.role as string | undefined;

  if (nextUrl.pathname.startsWith("/login")) {
    return NextResponse.next();
  }

  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  const matchedPrefix = Object.keys(ROLE_ROUTES).find((p) =>
    nextUrl.pathname.startsWith(p)
  );

  if (matchedPrefix && role && !ROLE_ROUTES[matchedPrefix].includes(role)) {
    return NextResponse.redirect(new URL("/unauthorized", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/superadmin/:path*", "/teacher/:path*", "/student/:path*"],
};
