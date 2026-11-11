import type { NextAuthConfig } from "next-auth";

const ROLE_ROUTES: Record<string, string[]> = {
  "/superadmin": ["SUPERADMIN"],
  "/admin": ["SUPERADMIN", "ADMIN"],
  "/teacher": ["SUPERADMIN", "ADMIN", "TEACHER"],
  "/student": ["SUPERADMIN", "STUDENT"],
};

export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const role = (auth?.user as { role?: string } | undefined)?.role;

      if (nextUrl.pathname.startsWith("/login")) {
        return true;
      }

      if (!isLoggedIn) {
        return false;
      }

      const matchedPrefix = Object.keys(ROLE_ROUTES).find((p) =>
        nextUrl.pathname.startsWith(p)
      );

      if (matchedPrefix && role && !ROLE_ROUTES[matchedPrefix].includes(role)) {
        return Response.redirect(new URL("/unauthorized", nextUrl));
      }

      return true;
    },
    jwt({ token, user }) {
      if (user) {
        const u = user as { id?: string; role?: string };
        token.role = u.role;
        token.id = u.id;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        const u = session.user as { id?: string; role?: unknown };
        u.role = token.role;
        u.id = token.id as string | undefined;
      }
      return session;
    },
  },
  providers: [],
};
